"""Weechat Swap Live — moteur local (InsightFace + inswapper_128, ONNX Runtime CPU par défaut).

Webcam -> détection visage -> swap -> caméra virtuelle (Unity Capture ou OBS) + aperçu.
Aucune image n'est envoyée sur Internet ni enregistrée.
"""
import argparse
import os
import sys
import threading
import time

import cv2
import onnxruntime as ort

import weechat_models


def providers():
    # DirectML rejects inswapper's Reshape node on some GPUs (80070057), so CPU is the
    # default; set WEECHAT_GPU=1 to opt into GPU acceleration.
    if os.environ.get("WEECHAT_GPU") != "1":
        return ["CPUExecutionProvider"]
    available = ort.get_available_providers()
    order = [p for p in ("CUDAExecutionProvider", "DmlExecutionProvider") if p in available]
    return order + ["CPUExecutionProvider"]


def _probe(index, width=640, height=480):
    """Ouvre une caméra et renvoie (cap, frame) si elle donne une vraie image couleur."""
    cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap.release()
        return None, None
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    frame = None
    for _ in range(15):          # les webcams envoient souvent quelques images noires au début
        ok, f = cap.read()
        if ok and f is not None:
            frame = f
            if f.mean() > 12:
                break
        time.sleep(0.05)
    if frame is None:
        cap.release()
        return None, None
    return cap, frame


def is_color(frame):
    b, g, r = cv2.split(cv2.resize(frame, (64, 48)))
    return float(abs(b.astype(int) - r.astype(int)).mean()) > 2.0   # caméra IR = image grise


def open_camera(choice, log):
    """choice = 'auto' ou un index. En auto, ignore les caméras IR (Windows Hello) et noires."""
    if choice != "auto":
        cap, frame = _probe(int(choice))
        if cap is None:
            raise RuntimeError(f"Webcam {choice} inaccessible. Fermez les autres applications "
                               "qui l'utilisent, ou choisissez « auto ».")
        if frame.mean() <= 12:
            log(f"Attention : la webcam {choice} renvoie une image noire (cache, touche caméra ou caméra IR ?).")
        return cap, int(choice)
    fallback = None
    for i in range(4):
        cap, frame = _probe(i)
        if cap is None:
            continue
        if frame.mean() > 12 and is_color(frame):
            if fallback:
                fallback[0].release()
            log(f"Webcam détectée automatiquement : {i}")
            return cap, i
        if fallback is None:
            fallback = (cap, i)
        else:
            cap.release()
    if fallback:
        log(f"Seule la webcam {fallback[1]} répond mais son image est noire ou grise : "
            "vérifiez le cache, la touche caméra du clavier et les autorisations Windows.")
        return fallback
    raise RuntimeError("Aucune webcam trouvée. Vérifiez la touche caméra du clavier, "
                       "Paramètres > Confidentialité > Caméra, et fermez les autres applications.")


def open_vcam(width, height, log):
    import pyvirtualcam
    for backend in ("unitycapture", "obs", None):
        try:
            cam = pyvirtualcam.Camera(width=width, height=height, fps=20, backend=backend, **({"device": "Weechat Camera"} if backend == "unitycapture" else {})) if backend \
                else pyvirtualcam.Camera(width=width, height=height, fps=20)
            log(f"Caméra virtuelle active : {cam.device} — choisissez-la dans WhatsApp/Zoom/TikTok")
            return cam
        except Exception:
            continue
    log("Caméra virtuelle indisponible — aperçu seulement. Réinstallez Weechat.")
    return None


def sharpen_face(img, bbox, amount=0.8):
    """Le modèle rend le visage en 128x128 : on redonne du piqué à la zone du visage."""
    h, w = img.shape[:2]
    x1, y1, x2, y2 = [int(v) for v in bbox]
    m = int(0.15 * max(x2 - x1, y2 - y1))
    x1, y1, x2, y2 = max(0, x1 - m), max(0, y1 - m), min(w, x2 + m), min(h, y2 + m)
    if x2 - x1 < 8 or y2 - y1 < 8:
        return img
    roi = img[y1:y2, x1:x2]
    blur = cv2.GaussianBlur(roi, (0, 0), 1.6)
    img[y1:y2, x1:x2] = cv2.addWeighted(roi, 1 + amount, blur, -amount, 0)
    return img


def run(face, camera="auto", width=1280, height=720, det_size=320, vcam_on=True,
        stop_event=None, log=print, preview=True, on_frame=None, root=None):
    stop_event = stop_event or threading.Event()

    # 1. Webcam d'abord : l'utilisateur voit son image tout de suite, jamais d'écran noir muet.
    log("Étape 1/3 — ouverture de la webcam…")
    cap, cam_index = open_camera(str(camera), log)
    ok, first = cap.read()
    if ok and on_frame is not None:
        on_frame(first, 0.0)

    try:
        # 2. Moteur IA (la webcam reste affichée pendant le chargement).
        log("Étape 2/3 — chargement du moteur IA (10 à 60 s)…")
        loading = {"done": False}

        def keep_preview():
            while not loading["done"] and not stop_event.is_set():
                ok2, f = cap.read()
                if ok2 and on_frame is not None:
                    on_frame(f, 0.0)
                time.sleep(0.05)
        t = threading.Thread(target=keep_preview, daemon=True)
        t.start()
        try:
            import insightface
            from insightface.app import FaceAnalysis
            root = root or weechat_models.models_root()
            if not root:
                raise RuntimeError("Modèles IA absents. Relancez Weechat pour les télécharger.")
            prov = providers()
            log(f"Moteur d'exécution : {prov[0]}")
            analyser = FaceAnalysis(name="buffalo_l", root=root, providers=prov,
                                    allowed_modules=["detection", "recognition"])
            analyser.prepare(ctx_id=0, det_size=(det_size, det_size))
            swapper = insightface.model_zoo.get_model(
                os.path.join(root, "models", "inswapper_128.onnx"), providers=prov)

            target = cv2.imread(face)
            if target is None:   # chemins avec accents : cv2.imread échoue sous Windows
                import numpy as np
                data = np.fromfile(face, dtype=np.uint8)
                target = cv2.imdecode(data, cv2.IMREAD_COLOR) if data.size else None
            if target is None:
                raise RuntimeError("Photo illisible : " + face)
            faces = analyser.get(target)
            if not faces:
                raise RuntimeError("Aucun visage détecté sur la photo. Utilisez une photo de face, bien éclairée.")
            source = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
        finally:
            loading["done"] = True
            t.join(timeout=1)

        # 3. Swap en direct.
        vcam = open_vcam(width, height, log) if vcam_on else None
        log(f"Étape 3/3 — Swap Live démarré (webcam {cam_index}).")
        last, fps, misses = time.time(), 0.0, 0
        try:
            while not stop_event.is_set():
                ok, frame = cap.read()
                if not ok:
                    misses += 1
                    if misses > 50:
                        raise RuntimeError("La webcam a cessé d'envoyer des images.")
                    time.sleep(0.02)
                    continue
                misses = 0
                out = cv2.resize(frame, (width, height))
                for f in analyser.get(out):
                    out = swapper.get(out, f, source, paste_back=True)
                    out = sharpen_face(out, f.bbox)
                now = time.time()
                fps = 0.9 * fps + 0.1 / max(now - last, 1e-6)
                last = now
                if vcam is not None:
                    vcam.send(cv2.cvtColor(out, cv2.COLOR_BGR2RGB))
                if on_frame is not None:
                    on_frame(out, fps)
                if preview:
                    p = out.copy()
                    cv2.putText(p, f"{fps:.1f} img/s", (10, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 255), 2)
                    cv2.imshow("Weechat Swap Live (Q pour quitter)", p)
                    if cv2.waitKey(1) & 0xFF in (ord("q"), ord("Q")):
                        break
        finally:
            if vcam is not None:
                vcam.close()
    finally:
        cap.release()
        if preview:
            cv2.destroyAllWindows()
        log("Swap Live arrêté.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--face", required=True)
    ap.add_argument("--camera", default="auto")
    ap.add_argument("--width", type=int, default=640)
    ap.add_argument("--height", type=int, default=480)
    ap.add_argument("--det-size", type=int, default=320)
    ap.add_argument("--no-vcam", action="store_true")
    a = ap.parse_args()
    try:
        root = weechat_models.ensure(lambda l, h, t: print(l, h, t))
        run(a.face, a.camera, a.width, a.height, a.det_size, not a.no_vcam, root=root)
    except RuntimeError as exc:
        sys.exit(str(exc))


if __name__ == "__main__":
    main()

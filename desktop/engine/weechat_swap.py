"""Weechat Swap Live — moteur local (InsightFace + inswapper_128, ONNX Runtime DirectML/CPU).

Webcam -> détection visage -> swap -> caméra virtuelle (Unity Capture ou OBS) + aperçu.
Aucune image n'est envoyée sur Internet ni enregistrée.
"""
import argparse
import os
import sys
import threading
import time
import urllib.request

import cv2
import onnxruntime as ort

if getattr(sys, "frozen", False):
    BASE_DIR = os.path.dirname(sys.executable)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "inswapper_128.onnx")
MODEL_URL = "https://huggingface.co/ezioruan/inswapper_128.onnx/resolve/main/inswapper_128.onnx"


def providers():
    available = ort.get_available_providers()
    order = [p for p in ("CUDAExecutionProvider", "DmlExecutionProvider") if p in available]
    return order + ["CPUExecutionProvider"]


def ensure_model():
    if os.path.exists(MODEL_PATH) and os.path.getsize(MODEL_PATH) > 100_000_000:
        return
    os.makedirs(MODEL_DIR, exist_ok=True)
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)


def open_vcam(width, height, log):
    import pyvirtualcam
    for backend in ("unitycapture", "obs", None):
        try:
            cam = pyvirtualcam.Camera(width=width, height=height, fps=20, backend=backend) if backend \
                else pyvirtualcam.Camera(width=width, height=height, fps=20)
            log(f"Caméra virtuelle active : {cam.device} — choisissez-la dans WhatsApp/Zoom/TikTok")
            return cam
        except Exception:
            continue
    log("Caméra virtuelle indisponible — aperçu seulement. Réinstallez Weechat.")
    return None


def run(face, camera=0, width=640, height=480, det_size=320, vcam_on=True,
        stop_event=None, log=print, preview=True, on_frame=None):
    import insightface
    from insightface.app import FaceAnalysis

    stop_event = stop_event or threading.Event()
    prov = providers()
    log(f"Moteur d'exécution : {prov[0]}")
    ensure_model()
    analyser = FaceAnalysis(name="buffalo_l", root=BASE_DIR, providers=prov,
                            allowed_modules=["detection", "recognition"])
    analyser.prepare(ctx_id=0, det_size=(det_size, det_size))
    swapper = insightface.model_zoo.get_model(MODEL_PATH, providers=prov)

    target = cv2.imread(face)
    if target is None:
        raise RuntimeError("Photo introuvable : " + face)
    faces = analyser.get(target)
    if not faces:
        raise RuntimeError("Aucun visage détecté sur la photo. Utilisez une photo de face, bien éclairée.")
    source = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))

    cap = cv2.VideoCapture(camera, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
    if not cap.isOpened():
        raise RuntimeError("Webcam inaccessible. Fermez les autres applications qui l'utilisent.")

    vcam = open_vcam(width, height, log) if vcam_on else None
    log("Swap Live démarré.")
    last, fps = time.time(), 0.0
    try:
        while not stop_event.is_set():
            ok, frame = cap.read()
            if not ok:
                break
            out = cv2.resize(frame, (width, height))
            for f in analyser.get(out):
                out = swapper.get(out, f, source, paste_back=True)
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
        cap.release()
        if vcam is not None:
            vcam.close()
        if preview:
            cv2.destroyAllWindows()
        log("Swap Live arrêté.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--face", required=True)
    ap.add_argument("--camera", type=int, default=0)
    ap.add_argument("--width", type=int, default=640)
    ap.add_argument("--height", type=int, default=480)
    ap.add_argument("--det-size", type=int, default=320)
    ap.add_argument("--no-vcam", action="store_true")
    a = ap.parse_args()
    try:
        run(a.face, a.camera, a.width, a.height, a.det_size, not a.no_vcam)
    except RuntimeError as exc:
        sys.exit(str(exc))


if __name__ == "__main__":
    main()

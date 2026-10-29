"""Weechat Swap Live — moteur local (Windows, sans carte NVIDIA requise).

Pipeline : webcam -> détection visage (InsightFace buffalo_l) -> inswapper_128 (ONNX)
-> caméra virtuelle (pyvirtualcam) + fenêtre d'aperçu.
Exécution via ONNX Runtime DirectML (GPU intégré Intel/AMD) avec repli CPU.
Aucune image n'est envoyée sur Internet ni enregistrée.

Usage : python weechat_swap.py --face chemin\\vers\\photo.jpg [--camera 0] [--width 640 --height 480]
"""
import argparse
import os
import sys
import time
import urllib.request

import cv2
import numpy as np
import onnxruntime as ort

MODEL_URL = "https://huggingface.co/ezioruan/inswapper_128.onnx/resolve/main/inswapper_128.onnx"
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "inswapper_128.onnx")


def providers():
    available = ort.get_available_providers()
    order = [p for p in ("CUDAExecutionProvider", "DmlExecutionProvider") if p in available]
    return order + ["CPUExecutionProvider"]


def ensure_model():
    if os.path.exists(MODEL_PATH) and os.path.getsize(MODEL_PATH) > 100_000_000:
        return
    os.makedirs(MODEL_DIR, exist_ok=True)
    print("Téléchargement du modèle inswapper_128 (~530 Mo, une seule fois)...")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--face", required=True, help="Photo du visage cible (vous devez en avoir les droits)")
    ap.add_argument("--camera", type=int, default=0)
    ap.add_argument("--width", type=int, default=640)
    ap.add_argument("--height", type=int, default=480)
    ap.add_argument("--det-size", type=int, default=320, help="320 = rapide, 640 = précis")
    ap.add_argument("--no-vcam", action="store_true", help="Aperçu seulement, sans caméra virtuelle")
    args = ap.parse_args()

    import insightface
    from insightface.app import FaceAnalysis

    prov = providers()
    print("Moteur d'exécution :", prov[0])

    ensure_model()
    analyser = FaceAnalysis(name="buffalo_l", providers=prov, allowed_modules=["detection", "recognition"])
    analyser.prepare(ctx_id=0, det_size=(args.det_size, args.det_size))
    swapper = insightface.model_zoo.get_model(MODEL_PATH, providers=prov)

    target_img = cv2.imread(args.face)
    if target_img is None:
        sys.exit("Photo introuvable : " + args.face)
    target_faces = analyser.get(target_img)
    if not target_faces:
        sys.exit("Aucun visage détecté sur la photo cible. Utilisez une photo de face, bien éclairée.")
    source_face = max(target_faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))

    cap = cv2.VideoCapture(args.camera, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, args.width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, args.height)
    if not cap.isOpened():
        sys.exit("Webcam inaccessible. Fermez les autres applications qui l'utilisent.")

    vcam = None
    if not args.no_vcam:
        try:
            import pyvirtualcam
            vcam = pyvirtualcam.Camera(width=args.width, height=args.height, fps=20)
            print("Caméra virtuelle active :", vcam.device, "-> choisissez-la dans WhatsApp/Zoom/TikTok")
        except Exception as exc:  # pas de pilote installé
            print("Caméra virtuelle indisponible (", exc, ") — aperçu seulement.")

    last = time.time()
    fps = 0.0
    print("Appuyez sur Q dans la fenêtre d'aperçu pour arrêter.")
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            frame = cv2.resize(frame, (args.width, args.height))
            out = frame
            faces = analyser.get(frame)
            for face in faces:
                out = swapper.get(out, face, source_face, paste_back=True)
            now = time.time()
            fps = 0.9 * fps + 0.1 * (1.0 / max(now - last, 1e-6))
            last = now
            if vcam is not None:
                vcam.send(cv2.cvtColor(out, cv2.COLOR_BGR2RGB))
            preview = out.copy()
            cv2.putText(preview, f"{fps:.1f} img/s", (10, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 255), 2)
            cv2.imshow("Weechat Swap Live (Q pour quitter)", preview)
            if cv2.waitKey(1) & 0xFF in (ord("q"), ord("Q")):
                break
    finally:
        cap.release()
        if vcam is not None:
            vcam.close()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()

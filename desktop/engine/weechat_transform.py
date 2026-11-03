"""Weechat Studio — Cas 2 : transformer une vidéo MP4 avec le visage d'une photo autorisée.

Traitement 100 % local, image par image, son d'origine conservé.
Le résultat est enregistré sur le Bureau puis peut être diffusé avec le Cas 1.
Tarif prévu : forfait en points par vidéo. Ce module ne débite PAS encore de points :
le moteur Windows n'est pas relié au compte Weechat.
"""
import os
import subprocess
import sys
import time

import cv2
import numpy as np

import weechat_models
import weechat_swap

MAX_SIDE = 1280  # au-delà, l'image est réduite pour garder un temps de calcul raisonnable


def read_image(path):
    img = cv2.imread(path)
    if img is None:  # chemins avec accents sous Windows
        data = np.fromfile(path, dtype=np.uint8)
        img = cv2.imdecode(data, cv2.IMREAD_COLOR) if data.size else None
    if img is None:
        raise RuntimeError("Photo illisible : " + path)
    return img


def output_path(video):
    base = os.path.splitext(os.path.basename(video))[0]
    desk = os.path.join(os.path.expanduser("~"), "Desktop")
    folder = desk if os.path.isdir(desk) else os.path.dirname(video)
    return os.path.join(folder, f"{base}_avatar_{time.strftime('%Y%m%d_%H%M%S')}.mp4")


def load_engine(root, log):
    import insightface
    from insightface.app import FaceAnalysis
    root = root or weechat_models.models_root()
    if not root:
        raise RuntimeError("Modèles IA absents. Relancez Weechat pour les télécharger.")
    prov = weechat_swap.providers()
    analyser = FaceAnalysis(name="buffalo_l", root=root, providers=prov,
                            allowed_modules=["detection", "recognition"])
    analyser.prepare(ctx_id=0, det_size=(640, 640))
    swapper = insightface.model_zoo.get_model(
        os.path.join(root, "models", "inswapper_128.onnx"), providers=prov)
    return analyser, swapper


def mux_audio(silent, source, final, log):
    """Recompose la vidéo en H.264 avec le son de la vidéo d'origine (si présent)."""
    import imageio_ffmpeg
    flags = 0x08000000 if sys.platform == "win32" else 0
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-v", "error", "-i", silent, "-i", source,
           "-map", "0:v:0", "-map", "1:a:0?", "-c:v", "libx264", "-preset", "veryfast",
           "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
           "-shortest", "-movflags", "+faststart", final]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                          stdin=subprocess.DEVNULL, creationflags=flags)
    if proc.returncode != 0 or not os.path.exists(final):
        log("Son non ajouté : vidéo enregistrée sans son.")
        os.replace(silent, final)
        return False
    os.remove(silent)
    return True


def transform(video, face, stop_event, log=print, on_frame=None, root=None, out=None):
    """Renvoie le chemin du MP4 créé, ou None si l'utilisateur a annulé."""
    cap = cv2.VideoCapture(video)
    if not cap.isOpened():
        raise RuntimeError("Impossible d'ouvrir cette vidéo (MP4/MOV/AVI/MKV attendu).")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    fps = fps if 1 <= fps <= 60 else 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    s = min(1.0, MAX_SIDE / max(w, h, 1))
    w, h = int(w * s) // 2 * 2, int(h * s) // 2 * 2

    log("Cas 2 — chargement du moteur IA (10 à 60 s)…")
    analyser, swapper = load_engine(root, log)
    faces = analyser.get(read_image(face))
    if not faces:
        cap.release()
        raise RuntimeError("Aucun visage détecté sur la photo. Utilisez une photo de face, bien éclairée.")
    source = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))

    final = out or output_path(video)
    silent = final + ".tmp.avi"
    writer = cv2.VideoWriter(silent, cv2.VideoWriter_fourcc(*"MJPG"), fps, (w, h))
    if not writer.isOpened():
        cap.release()
        raise RuntimeError("Impossible de créer le fichier de sortie.")

    n, swapped, t0 = 0, 0, time.time()
    try:
        while not stop_event.is_set():
            ok, frame = cap.read()
            if not ok:
                break
            if frame.shape[1] != w or frame.shape[0] != h:
                frame = cv2.resize(frame, (w, h), interpolation=cv2.INTER_AREA)
            found = analyser.get(frame)
            for f in found:
                frame = swapper.get(frame, f, source, paste_back=True)
            swapped += bool(found)
            writer.write(frame)
            n += 1
            if on_frame:
                on_frame(frame, n / max(time.time() - t0, 1e-6))
            if n % 10 == 0 or n == total:
                pct = f" — {100 * n / total:.0f} %" if total else ""
                log(f"Transformation : image {n}" + (f" / {total}" if total else "") + pct)
    finally:
        cap.release()
        writer.release()

    if stop_event.is_set():
        try:
            os.remove(silent)
        except OSError:
            pass
        log("Transformation annulée.")
        return None
    if n == 0:
        raise RuntimeError("La vidéo ne contient aucune image lisible.")
    if swapped == 0:
        os.remove(silent)
        raise RuntimeError("Aucun visage détecté dans la vidéo : filmez-vous de face, bien éclairé.")
    log("Finalisation et ajout du son…")
    mux_audio(silent, video, final, log)
    log(f"Vidéo prête : {final} ({swapped}/{n} images avec visage). Cliquez sur « Diffuser en boucle ».")
    return final

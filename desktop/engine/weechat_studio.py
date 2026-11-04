"""Weechat Studio — Diffusion Vidéo : diffusion d'une vidéo MP4 en boucle dans la caméra virtuelle.

Traitement 100 % local, aucune image envoyée ni enregistrée.
Tarif prévu : 1 point par seconde de diffusion. Ce module ne débite PAS encore de points :
le moteur Windows n'est pas relié au compte Weechat.
"""
import time

import cv2

import weechat_swap

OUT_W, OUT_H = 1280, 720


def fit(frame, w=OUT_W, h=OUT_H):
    """Redimensionne sans déformer, bandes noires si besoin."""
    fh, fw = frame.shape[:2]
    s = min(w / fw, h / fh)
    nw, nh = max(1, int(fw * s)), max(1, int(fh * s))
    img = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_AREA)
    out = cv2.copyMakeBorder(img, (h - nh) // 2, h - nh - (h - nh) // 2,
                             (w - nw) // 2, w - nw - (w - nw) // 2,
                             cv2.BORDER_CONSTANT, value=(0, 0, 0))
    return out


def play(path, stop_event, log=print, on_frame=None, loop=True, vcam_on=True, audio_out=None):
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise RuntimeError("Impossible d'ouvrir cette vidéo (format MP4/MOV/AVI/MKV attendu).")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    fps = fps if 1 <= fps <= 60 else 30.0
    player = None
    if audio_out:
        try:
            import weechat_audio
            pcm = weechat_audio.decode(path)
            if pcm is None:
                log("Cette vidéo ne contient pas de son.")
            else:
                player = weechat_audio.Player(pcm, audio_out, log)
        except Exception as exc:
            log(f"Son indisponible : {exc}")
    vcam = weechat_swap.open_vcam(OUT_W, OUT_H, log) if vcam_on else None
    log("Diffusion en cours" + (" dans « Weechat Camera »." if vcam else " (aperçu seulement).")
        + (" Son actif." if player else ""))
    delay, start, n = 1.0 / fps, time.perf_counter(), 0
    try:
        while not stop_event.is_set():
            ok, frame = cap.read()
            if not ok:
                if not loop:
                    break
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ok, frame = cap.read()
                if not ok:
                    raise RuntimeError("La vidéo ne contient aucune image lisible.")
                if player:
                    player.restart()
                start, n = time.perf_counter(), 0
            out = fit(frame)
            if vcam is not None:
                vcam.send(cv2.cvtColor(out, cv2.COLOR_BGR2RGB))
            if on_frame:
                on_frame(out, fps)
            n += 1
            wait = start + n * delay - time.perf_counter()
            if wait > 0:
                time.sleep(wait)
            elif wait < -1:
                start, n = time.perf_counter(), 0
    finally:
        cap.release()
        if player:
            player.close()
        if vcam is not None:
            vcam.close()
        log("Diffusion arrêtée.")

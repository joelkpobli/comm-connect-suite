"""Lecture de la piste audio d'une vidéo (Mode Studio), 100 % locale.

La piste est décodée par ffmpeg (fourni par imageio-ffmpeg) puis jouée avec sounddevice
vers la sortie choisie : haut-parleurs, ou « CABLE Input » pour que WhatsApp/TikTok
l'entendent via le micro « CABLE Output (VB-Audio) ».
"""
import subprocess
import sys
import threading

import numpy as np

RATE, CH = 48000, 2
DEFAULT = "Haut-parleurs (par défaut)"


def outputs():
    """Noms des sorties audio disponibles, CABLE Input en premier si présent."""
    try:
        import sounddevice as sd
        names = []
        for d in sd.query_devices():
            if d["max_output_channels"] > 0 and d["name"] not in names:
                names.append(d["name"])
    except Exception:
        return [DEFAULT]
    cable = [n for n in names if "cable input" in n.lower()]
    return cable[:1] + [DEFAULT] + [n for n in names if n not in cable[:1]]


def decode(path):
    """Renvoie la piste audio en int16 (N, 2), ou None si la vidéo n'a pas de son."""
    import imageio_ffmpeg
    flags = 0x08000000 if sys.platform == "win32" else 0  # CREATE_NO_WINDOW
    proc = subprocess.run(
        [imageio_ffmpeg.get_ffmpeg_exe(), "-v", "error", "-i", path, "-vn",
         "-f", "s16le", "-acodec", "pcm_s16le", "-ac", str(CH), "-ar", str(RATE), "-"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.DEVNULL,
        creationflags=flags)
    data = np.frombuffer(proc.stdout, dtype=np.int16)
    if data.size < CH * RATE // 10:
        return None
    return data[: data.size - data.size % CH].reshape(-1, CH)


class Player:
    """Joue la piste en boucle ; restart() la recale sur le début de la vidéo."""

    def __init__(self, pcm, device_name, log=print):
        import sounddevice as sd
        self.pcm, self.pos, self.lock = pcm, 0, threading.Lock()
        device = None
        if device_name and device_name != DEFAULT:
            for i, d in enumerate(sd.query_devices()):
                if d["name"] == device_name and d["max_output_channels"] > 0:
                    device = i
                    break
        self.stream = sd.OutputStream(samplerate=RATE, channels=CH, dtype="int16",
                                      device=device, callback=self._cb)
        self.stream.start()
        log(f"Son de la vidéo envoyé vers : {device_name or DEFAULT}")

    def _cb(self, out, frames, _time, _status):
        with self.lock:
            n, pos = len(self.pcm), self.pos
            idx = (np.arange(frames) + pos) % n
            out[:] = self.pcm[idx]
            self.pos = (pos + frames) % n

    def restart(self):
        with self.lock:
            self.pos = 0

    def close(self):
        try:
            self.stream.stop()
            self.stream.close()
        except Exception:
            pass

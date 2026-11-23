"""Mise à jour automatique de Weechat au démarrage (silencieuse, sans action technique)."""
import os
import subprocess
import sys
import tempfile
import threading
import urllib.request

try:
    from weechat_version import BUILD
except Exception:  # version de développement
    BUILD = 0

BASE = "https://github.com/joelkpobli/comm-connect-suite/releases/latest/download/"
VERSION_URL = BASE + "version.txt"
SETUP_URL = BASE + "Weechat-Setup.exe"


def latest_build(timeout=6):
    req = urllib.request.Request(VERSION_URL, headers={"User-Agent": "Weechat-Updater"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return int(r.read().decode("utf-8").strip() or 0)


def download_setup(progress=None):
    path = os.path.join(tempfile.gettempdir(), "Weechat-Setup-update.exe")
    req = urllib.request.Request(SETUP_URL, headers={"User-Agent": "Weechat-Updater"})
    with urllib.request.urlopen(req, timeout=30) as r, open(path, "wb") as f:
        total = int(r.headers.get("Content-Length") or 0)
        done = 0
        while True:
            chunk = r.read(256 * 1024)
            if not chunk:
                break
            f.write(chunk)
            done += len(chunk)
            if progress and total:
                progress(int(done * 100 / total))
    if os.path.getsize(path) < 1_000_000:
        raise RuntimeError("fichier de mise à jour incomplet")
    return path


def install_and_quit(path):
    # Installation silencieuse ; l'installateur relance Weechat tout seul à la fin.
    subprocess.Popen([path, "/SILENT", "/SUPPRESSMSGBOXES", "/NORESTART", "/CLOSEAPPLICATIONS"],
                     close_fds=True)
    os._exit(0)


def check_in_background(on_ready, log=print):
    """on_ready(path) est appelé quand une mise à jour est téléchargée et prête."""
    if BUILD == 0 or not getattr(sys, "frozen", False):
        return

    def job():
        try:
            latest = latest_build()
            if latest <= BUILD:
                return
            log("Nouvelle version de Weechat disponible, téléchargement en arrière-plan…")
            last = [-1]

            def prog(p):
                if p // 20 != last[0]:
                    last[0] = p // 20
                    log(f"Mise à jour : {p} %")
            on_ready(download_setup(prog))
        except Exception:
            pass  # hors ligne ou serveur indisponible : Weechat démarre normalement
    threading.Thread(target=job, daemon=True).start()

"""Téléchargement unique des modèles IA, avec reprise automatique après coupure.

Les modèles vont dans %LOCALAPPDATA%\\Weechat\\models (inscriptible sans droits
admin) et ne sont plus jamais retéléchargés une fois vérifiés. Un ancien dossier
d'installation complet (models à côté de Weechat.exe) est réutilisé tel quel.
"""
import os
import sys
import time
import urllib.request
import zipfile

if getattr(sys, "frozen", False):
    APP_DIR = os.path.dirname(sys.executable)
else:
    APP_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.environ.get("LOCALAPPDATA") or os.path.expanduser("~"), "Weechat")

SWAP_URL = "https://huggingface.co/ezioruan/inswapper_128.onnx/resolve/main/inswapper_128.onnx"
BUFFALO_URL = "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip"
SWAP_MIN = 500_000_000      # inswapper_128.onnx ≈ 554 Mo
NEEDED = {"det_10g.onnx": 10_000_000, "w600k_r50.onnx": 150_000_000}


def _complete(root):
    swap = os.path.join(root, "models", "inswapper_128.onnx")
    buf = os.path.join(root, "models", "buffalo_l")
    if not (os.path.isfile(swap) and os.path.getsize(swap) >= SWAP_MIN):
        return False
    return all(os.path.isfile(os.path.join(buf, n)) and os.path.getsize(os.path.join(buf, n)) >= m
               for n, m in NEEDED.items())


def models_root():
    """Dossier racine contenant models/ prêt, ou None."""
    for root in (DATA_DIR, APP_DIR):
        if _complete(root):
            return root
    return None


def _download(url, dest, label, progress, stop):
    part = dest + ".part"
    attempt = 0
    while True:
        if stop is not None and stop.is_set():
            raise RuntimeError("Téléchargement interrompu.")
        have = os.path.getsize(part) if os.path.exists(part) else 0
        req = urllib.request.Request(url, headers={"User-Agent": "Weechat", "Range": f"bytes={have}-"})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                if have and resp.status != 206:      # serveur sans reprise : on repart de zéro
                    have = 0
                    open(part, "wb").close()
                total = have + int(resp.headers.get("Content-Length") or 0)
                with open(part, "ab") as fh:
                    while True:
                        if stop is not None and stop.is_set():
                            raise RuntimeError("Téléchargement interrompu.")
                        chunk = resp.read(1 << 20)
                        if not chunk:
                            break
                        fh.write(chunk)
                        have += len(chunk)
                        progress(label, have, total)
            if total and have < total:
                raise OSError("connexion coupée")
            os.replace(part, dest)
            return
        except urllib.error.HTTPError as exc:
            if exc.code == 416:                     # déjà entièrement reçu
                os.replace(part, dest)
                return
            err = exc
        except (OSError, TimeoutError) as exc:
            err = exc
        attempt += 1
        wait = min(30, 2 * attempt)
        progress(f"{label} — coupure réseau ({err}), reprise dans {wait} s", have, 0)
        time.sleep(wait)


def ensure(progress, stop=None):
    """Garantit la présence des modèles ; renvoie le dossier racine à utiliser."""
    root = models_root()
    if root:
        return root
    mdir = os.path.join(DATA_DIR, "models")
    buf = os.path.join(mdir, "buffalo_l")
    os.makedirs(buf, exist_ok=True)
    swap = os.path.join(mdir, "inswapper_128.onnx")
    if not (os.path.isfile(swap) and os.path.getsize(swap) >= SWAP_MIN):
        _download(SWAP_URL, swap, "Modèle de visage (1/2)", progress, stop)
    if not _complete(DATA_DIR):
        z = os.path.join(mdir, "buffalo_l.zip")
        _download(BUFFALO_URL, z, "Modèle de détection (2/2)", progress, stop)
        progress("Décompression…", 0, 0)
        with zipfile.ZipFile(z) as zf:
            for info in zf.infolist():
                name = os.path.basename(info.filename)
                if name.endswith(".onnx"):
                    with zf.open(info) as src, open(os.path.join(buf, name), "wb") as dst:
                        dst.write(src.read())
        os.remove(z)
    if not _complete(DATA_DIR):
        raise RuntimeError("Modèles incomplets après téléchargement. Relancez Weechat pour reprendre.")
    return DATA_DIR

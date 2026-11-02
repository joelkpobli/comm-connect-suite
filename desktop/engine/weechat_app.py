"""Weechat Swap Live — application de bureau (fenêtre graphique, aucun terminal)."""
import os
import sys

# Sans console (PyInstaller --noconsole), sys.stdout/stderr valent None :
# toute écriture (print, barres de progression des modèles) plantait avec
# "'NoneType' object has no attribute 'write'". On les redirige vers un log.
if sys.stdout is None or sys.stderr is None:
    try:
        _log = open(os.path.join(os.path.expanduser("~"), "Desktop", "weechat_console.txt"),
                    "a", encoding="utf-8", buffering=1)
    except OSError:
        _log = open(os.devnull, "w")
    if sys.stdout is None:
        sys.stdout = _log
    if sys.stderr is None:
        sys.stderr = _log

import threading
import time
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

import cv2
from PIL import Image, ImageTk

import weechat_models
import weechat_swap

BG, FG, ACCENT = "#0b1530", "#e6ecff", "#2f6bff"


class App:
    def __init__(self, root):
        self.root = root
        self.stop = threading.Event()
        self.worker = None
        self.face = None
        self.frame = None
        root.title("Weechat Swap Live")
        root.configure(bg=BG)
        root.geometry("760x760")

        tk.Label(root, text="Weechat Swap Live", bg=BG, fg=FG, font=("Segoe UI", 18, "bold")).pack(pady=10)
        bar = tk.Frame(root, bg=BG)
        bar.pack(pady=4)
        tk.Button(bar, text="1. Choisir la photo du visage", command=self.pick,
                  bg=ACCENT, fg="white", relief="flat", padx=12, pady=6).pack(side="left", padx=4)
        tk.Label(bar, text="Webcam :", bg=BG, fg=FG).pack(side="left", padx=(12, 2))
        self.cam = ttk.Combobox(bar, values=["auto", "0", "1", "2", "3"], width=5, state="readonly")
        self.cam.set("auto")
        self.models = None
        self.cam.pack(side="left")
        self.btn = tk.Button(bar, text="2. Démarrer", command=self.toggle,
                             bg=ACCENT, fg="white", relief="flat", padx=12, pady=6)
        self.btn.pack(side="left", padx=8)

        self.face_lbl = tk.Label(root, text="Aucune photo choisie", bg=BG, fg=FG)
        self.face_lbl.pack()
        self.status = tk.Label(root, text="Prêt. Utilisez uniquement une photo dont vous avez les droits.",
                               bg=BG, fg="#ffd27a", wraplength=700, font=("Segoe UI", 11, "bold"))
        self.status.pack(pady=4)
        tk.Label(root, text="3. Dans WhatsApp / Zoom / TikTok, choisissez la caméra « Unity Video Capture ».",
                 bg=BG, fg="#9fb3e6").pack(pady=4)
        # Fixed pixel-size box: a text Label's width/height are in characters, which pushed status off-screen.
        box = tk.Frame(root, bg="black", width=640, height=480)
        box.pack(pady=8)
        box.pack_propagate(False)
        self.view = tk.Label(box, bg="black")
        self.view.pack(fill="both", expand=True)
        root.protocol("WM_DELETE_WINDOW", self.close)
        self.refresh()

    def log(self, msg):
        try:
            with open(os.path.join(os.path.expanduser("~"), "Desktop", "weechat_log.txt"), "a",
                      encoding="utf-8") as fh:
                fh.write(time.strftime("%H:%M:%S ") + str(msg) + "\n")
        except OSError:
            pass
        self.root.after(0, lambda: self.status.config(text=msg))

    def pick(self):
        path = filedialog.askopenfilename(filetypes=[("Images", "*.jpg *.jpeg *.png *.webp")])
        if path:
            self.face = path
            self.face_lbl.config(text=path)

    def on_frame(self, img, fps):
        self.frame = (img, fps)

    def refresh(self):
        if self.frame is not None:
            img, fps = self.frame
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            photo = ImageTk.PhotoImage(Image.fromarray(rgb))
            self.view.config(image=photo)
            self.view.image = photo
            self.root.title(f"Weechat Swap Live — {fps:.1f} img/s")
        self.root.after(40, self.refresh)

    def toggle(self):
        if self.worker and self.worker.is_alive():
            self.stop.set()
            self.btn.config(text="2. Démarrer")
            return
        if not self.face:
            messagebox.showwarning("Weechat", "Choisissez d'abord une photo de visage.")
            return
        self.stop.clear()
        self.btn.config(text="Arrêter")
        self.log("Chargement du moteur IA (10 à 30 s)...")
        self.worker = threading.Thread(target=self.work, daemon=True)
        self.worker.start()

    def work(self):
        try:
            weechat_swap.run(self.face, camera=self.cam.get(), stop_event=self.stop,
                             log=self.log, preview=False, on_frame=self.on_frame, root=self.models)
        except Exception as exc:
            self.log(f"Erreur : {exc}")
        finally:
            self.root.after(0, lambda: self.btn.config(text="2. Démarrer"))

    def prepare_models(self):
        """Téléchargement unique des modèles au premier lancement, reprise automatique."""
        self.models = weechat_models.models_root()
        if self.models:
            return
        self.btn.config(state="disabled")
        self.log("Premier lancement : téléchargement des modèles IA (une seule fois, ~830 Mo). "
                 "Vous pouvez fermer Weechat : il reprendra où il s'est arrêté.")

        def progress(label, have, total):
            if total:
                self.log(f"{label} : {have / 1e6:.0f} / {total / 1e6:.0f} Mo ({100 * have / total:.0f} %)")
            else:
                self.log(label)

        def job():
            try:
                self.models = weechat_models.ensure(progress, self.stop)
                self.log("Modèles prêts. Choisissez une photo puis cliquez sur Démarrer.")
                self.root.after(0, lambda: self.btn.config(state="normal"))
            except Exception as exc:
                self.log(f"Erreur de téléchargement : {exc} — relancez Weechat pour reprendre.")
        threading.Thread(target=job, daemon=True).start()

    def close(self):
        self.stop.set()
        self.root.after(300, self.root.destroy)


if __name__ == "__main__":
    r = tk.Tk()
    a = App(r)
    a.prepare_models()
    r.mainloop()

"""Weechat Swap Live — application de bureau (fenêtre graphique, aucun terminal)."""
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

import cv2
from PIL import Image, ImageTk

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
        root.geometry("760x680")

        tk.Label(root, text="Weechat Swap Live", bg=BG, fg=FG, font=("Segoe UI", 18, "bold")).pack(pady=10)
        bar = tk.Frame(root, bg=BG)
        bar.pack(pady=4)
        tk.Button(bar, text="1. Choisir la photo du visage", command=self.pick,
                  bg=ACCENT, fg="white", relief="flat", padx=12, pady=6).pack(side="left", padx=4)
        tk.Label(bar, text="Webcam :", bg=BG, fg=FG).pack(side="left", padx=(12, 2))
        self.cam = ttk.Combobox(bar, values=["0", "1", "2", "3"], width=3, state="readonly")
        self.cam.set("0")
        self.cam.pack(side="left")
        self.btn = tk.Button(bar, text="2. Démarrer", command=self.toggle,
                             bg=ACCENT, fg="white", relief="flat", padx=12, pady=6)
        self.btn.pack(side="left", padx=8)

        self.face_lbl = tk.Label(root, text="Aucune photo choisie", bg=BG, fg=FG)
        self.face_lbl.pack()
        self.view = tk.Label(root, bg="black", width=640, height=480)
        self.view.pack(pady=8)
        self.status = tk.Label(root, text="Prêt. Utilisez uniquement une photo dont vous avez les droits.",
                               bg=BG, fg=FG, wraplength=700)
        self.status.pack()
        tk.Label(root, text="3. Dans WhatsApp / Zoom / TikTok, choisissez la caméra « Unity Video Capture ».",
                 bg=BG, fg="#9fb3e6").pack(pady=4)
        root.protocol("WM_DELETE_WINDOW", self.close)
        self.refresh()

    def log(self, msg):
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
            self.view.config(image=photo, width=rgb.shape[1], height=rgb.shape[0])
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
            weechat_swap.run(self.face, camera=int(self.cam.get()), stop_event=self.stop,
                             log=self.log, preview=False, on_frame=self.on_frame)
        except Exception as exc:
            self.log(f"Erreur : {exc}")
        finally:
            self.root.after(0, lambda: self.btn.config(text="2. Démarrer"))

    def close(self):
        self.stop.set()
        self.root.after(300, self.root.destroy)


if __name__ == "__main__":
    r = tk.Tk()
    App(r)
    r.mainloop()

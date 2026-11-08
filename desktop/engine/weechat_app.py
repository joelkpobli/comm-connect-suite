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
import weechat_studio
import weechat_transform
import weechat_audio
import weechat_swap
import weechat_account
import webbrowser
import uuid

BG, PANEL, FG, MUTED, ACCENT, OK, WARN = "#0b1530", "#13214a", "#e6ecff", "#9fb3e6", "#2f6bff", "#2ecc71", "#ffd27a"
FONT = "Segoe UI"


def btn(parent, text, cmd, **kw):
    return tk.Button(parent, text=text, command=cmd, bg=kw.pop("bg", ACCENT), fg="white", relief="flat",
                     activebackground="#4a80ff", activeforeground="white", cursor="hand2",
                     font=(FONT, 10, "bold"), padx=14, pady=7, bd=0, **kw)


def lbl(parent, text="", fg=FG, size=10, bold=False, bg=PANEL, **kw):
    return tk.Label(parent, text=text, bg=bg, fg=fg, font=(FONT, size, "bold" if bold else "normal"), **kw)


class App:
    def __init__(self, root):
        self.root = root
        self.stop = threading.Event()
        self.worker = None
        self.face = None
        self.frame = None
        self.models = None
        self.video = None
        self.session = None
        self.license = False
        root.title("Weechat")
        root.configure(bg=BG)
        root.geometry("1180x760")
        root.minsize(1000, 680)
        st = ttk.Style()
        st.theme_use("clam")
        st.configure("TNotebook", background=PANEL, borderwidth=0)
        st.configure("TNotebook.Tab", background=BG, foreground=MUTED, padding=(14, 8), font=(FONT, 10, "bold"))
        st.map("TNotebook.Tab", background=[("selected", ACCENT)], foreground=[("selected", "white")])

        # En-tête : logo + compte
        head = tk.Frame(root, bg=BG)
        head.pack(fill="x", padx=18, pady=(12, 6))
        tk.Label(head, text="W", bg=ACCENT, fg="white", font=(FONT, 16, "bold"), width=2).pack(side="left")
        tk.Label(head, text="  Weechat", bg=BG, fg=FG, font=(FONT, 18, "bold")).pack(side="left")
        self.account = tk.Frame(head, bg=BG)
        self.account.pack(side="right")

        body = tk.Frame(root, bg=BG)
        body.pack(fill="both", expand=True, padx=18, pady=6)

        # Colonne gauche : grande prévisualisation
        left = tk.Frame(body, bg=PANEL)
        left.pack(side="left", fill="both", expand=True, padx=(0, 10))
        top = tk.Frame(left, bg=PANEL)
        top.pack(fill="x", padx=12, pady=(10, 4))
        lbl(top, "Aperçu de la caméra", size=12, bold=True).pack(side="left")
        self.badge = lbl(top, "● Weechat Camera inactive", fg=MUTED, bold=True)
        self.badge.pack(side="right")
        box = tk.Frame(left, bg="black", width=720, height=540)
        box.pack(padx=12, pady=6)
        box.pack_propagate(False)
        self.view = tk.Label(box, bg="black", fg=MUTED, text="L'image envoyée à vos appels s'affichera ici",
                             font=(FONT, 11))
        self.view.pack(fill="both", expand=True)
        self.status = lbl(left, "Prêt. Utilisez uniquement des photos et vidéos dont vous avez les droits.",
                          fg=WARN, bold=True, wraplength=700, justify="left")
        self.status.pack(fill="x", padx=12, pady=(4, 2))
        lbl(left, "Dans WhatsApp / Zoom / Meet / TikTok / Facebook Live, choisissez la caméra « Weechat Camera ».",
            fg=MUTED).pack(fill="x", padx=12, pady=(0, 10))

        # Colonne droite : onglets
        right = tk.Frame(body, bg=PANEL, width=400)
        right.pack(side="right", fill="y")
        right.pack_propagate(False)
        nb = ttk.Notebook(right)
        nb.pack(fill="both", expand=True, padx=8, pady=8)

        live = tk.Frame(nb, bg=PANEL)
        nb.add(live, text="Swap Live")
        lbl(live, "Votre visage remplacé en direct par une photo.", fg=MUTED, wraplength=360,
            justify="left").pack(anchor="w", padx=10, pady=(12, 8))
        btn(live, "1. Choisir la photo du visage", self.pick).pack(fill="x", padx=10, pady=4)
        self.face_lbl = lbl(live, "Aucune photo choisie", fg=MUTED, wraplength=360, justify="left")
        self.face_lbl.pack(anchor="w", padx=10)
        row = tk.Frame(live, bg=PANEL)
        row.pack(fill="x", padx=10, pady=10)
        lbl(row, "Webcam :").pack(side="left")
        self.cam = ttk.Combobox(row, values=["auto", "0", "1", "2", "3"], width=6, state="readonly")
        self.cam.set("auto")
        self.cam.pack(side="left", padx=6)
        self.btn = btn(live, "2. Démarrer le Swap Live", self.toggle, bg=OK)
        self.btn.pack(fill="x", padx=10, pady=4)

        diff = tk.Frame(nb, bg=PANEL)
        nb.add(diff, text="Studio Diffusion")
        lbl(diff, "Studio Diffusion Vidéo : diffuse une vidéo prête (MP4) en boucle dans Weechat Camera, avec son.",
            fg=MUTED, wraplength=360, justify="left").pack(anchor="w", padx=10, pady=(12, 8))
        btn(diff, "Choisir une vidéo", self.pick_video).pack(fill="x", padx=10, pady=4)
        self.video_lbl = lbl(diff, "Aucune vidéo choisie", fg=MUTED, wraplength=360, justify="left")
        self.video_lbl.pack(anchor="w", padx=10)
        lbl(diff, "Son de la vidéo :").pack(anchor="w", padx=10, pady=(10, 2))
        outs = weechat_audio.outputs() + ["Couper le son"]
        self.audio_out = tk.StringVar(value=outs[0])
        om = tk.OptionMenu(diff, self.audio_out, *outs)
        om.config(bg=BG, fg=FG, relief="flat", highlightthickness=0)
        om.pack(fill="x", padx=10)
        lbl(diff, "Pour vos appels : « CABLE Input » ici, puis micro « CABLE Output » dans l'application.",
            fg=MUTED, wraplength=360, justify="left").pack(anchor="w", padx=10, pady=6)
        self.studio_btn = btn(diff, "Diffuser en boucle", self.toggle_studio, bg=OK)
        self.studio_btn.pack(fill="x", padx=10, pady=4)

        tr = tk.Frame(nb, bg=PANEL)
        nb.add(tr, text="Transformation")
        lbl(tr, "Studio Transformation Avatar : crée une nouvelle vidéo MP4 avec le visage de la photo "
                "(choisis dans les onglets Swap Live et Studio Diffusion). Le résultat est enregistré "
                "sur le Bureau puis prêt à diffuser.", fg=MUTED, wraplength=360,
            justify="left").pack(anchor="w", padx=10, pady=(12, 8))
        btn(tr, "Choisir la photo", self.pick).pack(fill="x", padx=10, pady=3)
        btn(tr, "Choisir la vidéo", self.pick_video).pack(fill="x", padx=10, pady=3)
        self.transform_btn = btn(tr, "Lancer la transformation", self.toggle_transform, bg=OK)
        self.transform_btn.pack(fill="x", padx=10, pady=10)

        root.protocol("WM_DELETE_WINDOW", self.close)
        self.render_account()
        self.refresh()
        threading.Thread(target=self._restore, daemon=True).start()

    # ---------- Compte Weechat ----------
    def _restore(self):
        s = weechat_account.restore()
        if s:
            self.session = s
            self.load_balances()

    def render_account(self, points=None, seconds=None):
        for w in self.account.winfo_children():
            w.destroy()
        if not self.session:
            tk.Label(self.account, text="Mode invité — non connecté  ", bg=BG, fg=WARN,
                     font=(FONT, 10)).pack(side="left")
            btn(self.account, "Se connecter", self.login_dialog).pack(side="left", padx=4)
            btn(self.account, "Créer un compte", lambda: webbrowser.open(weechat_account.SITE + "/inscription"),
                bg=PANEL).pack(side="left")
            return
        email = (self.session.get("user") or {}).get("email", "")
        bal = "Chargement des soldes…" if points is None else \
            f"{points} points  ·  {seconds // 60} min {seconds % 60:02d} s audio"
        tk.Label(self.account, text=f"{email}   ", bg=BG, fg=FG, font=(FONT, 10, "bold")).pack(side="left")
        tk.Label(self.account, text=bal + "   ", bg=BG, fg=OK, font=(FONT, 10, "bold")).pack(side="left")
        if points is not None:
            tk.Label(self.account, text=("Licence Weechat Camera active ✓   " if self.license else
                                         "⚠ Licence Weechat Camera requise (10 000 FCFA)   "),
                     bg=BG, fg=OK if self.license else WARN, font=(FONT, 10, "bold")).pack(side="left")
        btn(self.account, "Recharger", lambda: webbrowser.open(weechat_account.SITE + "/credits"),
            bg=PANEL).pack(side="left", padx=4)
        btn(self.account, "Actualiser", self.load_balances, bg=PANEL).pack(side="left", padx=4)
        btn(self.account, "Déconnexion", self.logout, bg="#a33").pack(side="left")

    def load_balances(self):
        self.root.after(0, self.render_account)

        def job():
            try:
                p, s = weechat_account.balances(self.session)
                self.license = weechat_account.has_license(self.session)
                self.root.after(0, lambda: self.render_account(p, s))
            except weechat_account.AuthError as exc:
                self.log(f"Soldes indisponibles : {exc}")
        threading.Thread(target=job, daemon=True).start()

    def logout(self):
        self.stop.set()
        weechat_account.sign_out()
        self.session = None
        self.license = False
        self.render_account()

    def login_dialog(self):
        d = tk.Toplevel(self.root, bg=PANEL)
        d.title("Connexion Weechat")
        d.geometry("380x300")
        d.transient(self.root)
        d.grab_set()
        lbl(d, "Connexion à votre compte Weechat", size=12, bold=True).pack(pady=(16, 4))
        lbl(d, "Même email et mot de passe que sur le site.", fg=MUTED).pack()
        lbl(d, "Email").pack(anchor="w", padx=24, pady=(12, 0))
        em = tk.Entry(d, font=(FONT, 11))
        em.pack(fill="x", padx=24)
        lbl(d, "Mot de passe").pack(anchor="w", padx=24, pady=(8, 0))
        pw = tk.Entry(d, show="•", font=(FONT, 11))
        pw.pack(fill="x", padx=24)
        err = lbl(d, "", fg="#ff7a7a", wraplength=330)
        err.pack(pady=4)

        def go(*_):
            err.config(text="Connexion…")

            def job():
                try:
                    s = weechat_account.sign_in(em.get().strip(), pw.get())
                    self.session = s
                    self.root.after(0, d.destroy)
                    self.load_balances()
                except weechat_account.AuthError as exc:
                    self.root.after(0, lambda: err.config(text=str(exc)))
            threading.Thread(target=job, daemon=True).start()
        btn(d, "Se connecter", go).pack(fill="x", padx=24)
        pw.bind("<Return>", go)
        em.focus_set()

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

    def pick_video(self):
        path = filedialog.askopenfilename(filetypes=[("Vidéos", "*.mp4 *.mov *.avi *.mkv *.webm")])
        if path:
            self.video = path
            self.video_lbl.config(text=path)

    def allowed(self):
        """Connexion + licence obligatoires avant toute diffusion dans Weechat Camera."""
        if not self.session:
            messagebox.showwarning("Weechat", "Connectez-vous à votre compte Weechat pour utiliser la caméra.")
            return False
        try:
            self.license = weechat_account.has_license(self.session)
        except weechat_account.AuthError as exc:
            messagebox.showwarning("Weechat", f"Vérification de la licence impossible : {exc}")
            return False
        if not self.license:
            if messagebox.askyesno("Weechat", "La licence Weechat Camera (10 000 FCFA, à vie) est requise.\n"
                                              "Ouvrir la page d'achat ?"):
                webbrowser.open(weechat_account.SITE + "/credits")
            return False
        return True

    def meter(self, service):
        """Débite un bloc de 10 s avant chaque période ; arrête la diffusion si refusé."""
        sid, block = str(uuid.uuid4()), 0
        msgs = {"insufficient": "Solde de points épuisé. Rechargez sur votre compte Weechat.",
                "license_required": "Licence Weechat Camera requise.",
                "unauthorized": "Session expirée : reconnectez-vous.",
                "offline": "Connexion Internet perdue : diffusion arrêtée.",
                "failed": "Débit refusé par le serveur : diffusion arrêtée."}
        while not self.stop.is_set():
            try:
                bal = weechat_account.charge_block(self.session, service, sid, block)
            except weechat_account.ChargeError as exc:
                if exc.code == "unauthorized":
                    s = weechat_account.restore()
                    if s:
                        self.session = s
                        continue
                self.stop.set()
                self.log(msgs.get(exc.code, msgs["failed"]))
                self.root.after(0, lambda: messagebox.showwarning("Weechat", msgs.get(exc.code, msgs["failed"])))
                break
            self.root.after(0, self.load_balances)
            block += 1
            self.stop.wait(10)

    def start_meter(self, service):
        threading.Thread(target=self.meter, args=(service,), daemon=True).start()

    def busy(self):
        return self.worker is not None and self.worker.is_alive()

    def toggle_studio(self):
        if self.busy():
            self.stop.set()
            self.studio_btn.config(text="Diffuser en boucle")
            return
        if not self.video:
            messagebox.showwarning("Weechat", "Choisissez d'abord une vidéo dont vous avez les droits.")
            return
        if not self.allowed():
            return
        self.stop.clear()
        self.start_meter("studio_diffusion")
        self.studio_btn.config(text="Arrêter la diffusion")
        self.btn.config(state="disabled")

        def job():
            try:
                out = self.audio_out.get()
                weechat_studio.play(self.video, self.stop, log=self.log, on_frame=self.on_frame,
                                    audio_out=None if out == "Couper le son" else out)
            except Exception as exc:
                self.log(f"Erreur : {exc}")
            finally:
                self.root.after(0, lambda: (self.studio_btn.config(text="Diffuser en boucle"),
                                            self.btn.config(state="normal" if self.models else "disabled")))
        self.worker = threading.Thread(target=job, daemon=True)
        self.worker.start()

    def toggle_transform(self):
        if self.busy():
            self.stop.set()
            return
        if not self.video or not self.face:
            messagebox.showwarning("Weechat", "Choisissez une photo de visage ET une vidéo dont vous avez les droits.")
            return
        if not self.models:
            messagebox.showwarning("Weechat", "Attendez la fin du téléchargement des modèles IA.")
            return
        self.stop.clear()
        self.transform_btn.config(text="Annuler la transformation")
        self.btn.config(state="disabled")
        self.studio_btn.config(state="disabled")

        def job():
            try:
                result = weechat_transform.transform(self.video, self.face, self.stop, log=self.log,
                                                     on_frame=self.on_frame, root=self.models)
                if result:
                    self.video = result
                    self.root.after(0, lambda: self.video_lbl.config(text=result))
            except Exception as exc:
                self.log(f"Erreur : {exc}")
            finally:
                self.root.after(0, lambda: (self.transform_btn.config(text="Lancer la transformation"),
                                            self.studio_btn.config(state="normal"),
                                            self.btn.config(state="normal" if self.models else "disabled")))
        self.worker = threading.Thread(target=job, daemon=True)
        self.worker.start()

    def on_frame(self, img, fps):
        self.frame = (img, fps)

    def refresh(self):
        if self.frame is not None:
            img, fps = self.frame
            h, w = img.shape[:2]
            s = min(720 / w, 540 / h, 1.0)
            if s < 1.0:
                img = cv2.resize(img, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            photo = ImageTk.PhotoImage(Image.fromarray(rgb))
            self.view.config(image=photo)
            self.view.image = photo
            self.root.title(f"Weechat — {fps:.1f} img/s")
            self.badge.config(text=f"● Weechat Camera active · {fps:.0f} img/s", fg=OK)
        if not self.busy():
            self.badge.config(text="● Weechat Camera inactive", fg=MUTED)
        self.root.after(40, self.refresh)

    def toggle(self):
        if self.worker and self.worker.is_alive():
            self.stop.set()
            self.btn.config(text="2. Démarrer le Swap Live")
            return
        if not self.face:
            messagebox.showwarning("Weechat", "Choisissez d'abord une photo de visage.")
            return
        if not self.allowed():
            return
        self.stop.clear()
        self.start_meter("swap_live")
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
            self.root.after(0, lambda: self.btn.config(text="2. Démarrer le Swap Live"))

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

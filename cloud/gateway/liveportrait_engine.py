"""Moteur Weechat « Live Reenactment » basé sur LivePortrait (KwaiVGI, licence MIT).

L'avatar choisi (photo avec SA tenue et SON décor) est animé par les mouvements
de la webcam : tête, regard, clignements, bouche, expressions. La webcam ne sert
que de capteur ; l'image renvoyée est 100 % l'avatar.
Limite honnête : LivePortrait anime un portrait (tête + haut du corps visibles
sur la photo). Il ne fait pas bouger des jambes ni ne fait danser un corps entier.
Statut : code prêt, NON validé sur GPU tant qu'un pod n'a pas été testé.
"""
import os, sys
import numpy as np, cv2

LP_DIR = os.environ.get("LIVEPORTRAIT_DIR", "/opt/LivePortrait")
AVATAR_DIR = os.environ.get("WEECHAT_AVATAR_DIR", "/app/avatars")
_w = _crop = _cfg = None


def load():
    global _w, _crop, _cfg
    sys.path.insert(0, LP_DIR)
    from src.config.inference_config import InferenceConfig
    from src.config.crop_config import CropConfig
    from src.live_portrait_wrapper import LivePortraitWrapper
    from src.utils.cropper import Cropper
    _cfg = InferenceConfig(flag_use_half_precision=True)
    _w = LivePortraitWrapper(inference_cfg=_cfg)
    _crop = Cropper(crop_cfg=CropConfig())


def avatar_path(avatar_id):
    """Seuls les avatars du catalogue serveur sont acceptés (pas de chemin libre)."""
    if not avatar_id or not avatar_id.replace("-", "").replace("_", "").isalnum():
        return None
    p = os.path.join(AVATAR_DIR, f"{avatar_id}.jpg")
    return p if os.path.isfile(p) else None


class Session:
    def __init__(self, avatar_file):
        from src.utils.camera import get_rotation_matrix
        self._rot = get_rotation_matrix
        if isinstance(avatar_file, (bytes, bytearray)):
            img = cv2.imdecode(np.frombuffer(avatar_file, np.uint8), cv2.IMREAD_COLOR)
        else:
            img = cv2.imread(avatar_file)
        if img is None:
            raise ValueError("photo illisible")
        h, w = img.shape[:2]
        if max(h, w) > 1280:
            k = 1280 / max(h, w); img = cv2.resize(img, (int(w * k), int(h * k)))
        src = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        info = _crop.crop_source_image(src, _crop.crop_cfg)
        if info is None:
            raise ValueError("Aucun visage détecté sur l'avatar")
        I_s = _w.prepare_source(info["img_crop_256x256"])
        self.xs = _w.get_kp_info(I_s)
        self.Rs = get_rotation_matrix(self.xs["pitch"], self.xs["yaw"], self.xs["roll"])
        self.fs = _w.extract_feature_3d(I_s)
        self.x_s = _w.transform_keypoint(self.xs)
        self.M = info["M_c2o"]
        self.src = src
        self.ref = None  # première pose de la webcam = pose neutre

    def _drive(self, bgr):
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        crop = _crop.crop_source_image(rgb, _crop.crop_cfg)
        if crop is None:
            return None
        xd = _w.get_kp_info(_w.prepare_source(crop["img_crop_256x256"]))
        xd["R"] = self._rot(xd["pitch"], xd["yaw"], xd["roll"])
        return xd

    def process(self, bgr):
        xd = self._drive(bgr)
        if xd is None:  # visage perdu : on garde l'avatar immobile, jamais la vraie webcam
            return cv2.cvtColor(self.src, cv2.COLOR_RGB2BGR)
        if self.ref is None:
            self.ref = xd
        r = self.ref
        R = (xd["R"] @ r["R"].transpose(1, 2)) @ self.Rs
        exp = self.xs["exp"] + (xd["exp"] - r["exp"])
        t = self.xs["t"] + (xd["t"] - r["t"]); t[..., 2] = 0
        x_d = self.xs["scale"] * (self.xs["kp"] @ R + exp) + t
        out = _w.warp_decode(self.fs, self.x_s, x_d)
        face = _w.parse_output(out["out"])[0]
        from src.utils.crop import paste_back, prepare_paste_back
        mask = prepare_paste_back(_cfg.mask_crop, self.M, dsize=(self.src.shape[1], self.src.shape[0]))
        full = paste_back(face, self.M, self.src, mask)
        return cv2.cvtColor(np.ascontiguousarray(full), cv2.COLOR_RGB2BGR)

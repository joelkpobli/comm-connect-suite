"""Connexion au compte Weechat (même compte que le site) et lecture des soldes.

Utilise uniquement la clé publique (anon) : les droits sont contrôlés côté
serveur par les règles d'accès Supabase. Aucun secret n'est stocké ici.
La session (jeton de rafraîchissement) est gardée dans %APPDATA%/Weechat.
"""
import json
import os
import urllib.error
import urllib.request

URL = "https://psairuwdemxnwdkhpzsw.supabase.co"
ANON = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzYWlydXdkZW14bndka2hwenN3Iiwicm9sZSI6"
        "ImFub24iLCJpYXQiOjE3OTIxMTE3NzQsImV4cCI6MjEwNzY4Nzc3NH0.uHihAQ6uLE_dkQDamLA4VI3ZbTk5XqjAjhVeXeoCMMQ")
SITE = "https://www.weechat.online"
_DIR = os.path.join(os.environ.get("APPDATA") or os.path.expanduser("~"), "Weechat")
_FILE = os.path.join(_DIR, "session.json")


class AuthError(Exception):
    pass


def _req(path, body=None, token=None):
    headers = {"apikey": ANON, "Content-Type": "application/json",
               "Authorization": f"Bearer {token or ANON}"}
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(URL + path, data=data, headers=headers,
                                 method="POST" if data is not None else "GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            raw = r.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        try:
            j = json.loads(e.read())
            msg = j.get("msg") or j.get("error_description")
        except Exception:
            msg = None
        if e.code in (400, 401):
            raise AuthError(msg or "Email ou mot de passe incorrect, ou email non confirmé.")
        raise AuthError(f"Erreur serveur ({e.code}).")
    except urllib.error.URLError:
        raise AuthError("Pas de connexion Internet.")


def _save(s):
    os.makedirs(_DIR, exist_ok=True)
    with open(_FILE, "w", encoding="utf-8") as f:
        json.dump({"refresh_token": s["refresh_token"]}, f)


def sign_in(email, password):
    s = _req("/auth/v1/token?grant_type=password", {"email": email, "password": password})
    _save(s)
    return s


GOOGLE_PORT = 53682
GOOGLE_REDIRECT = f"http://127.0.0.1:{GOOGLE_PORT}/callback"


def sign_in_google(open_url, timeout=180):
    """Connexion Google par le navigateur (PKCE) : ouvre une session propre à l'application.

    Le navigateur revient sur 127.0.0.1 (ce PC uniquement) avec un code à usage unique,
    échangé ici contre une session. Aucun mot de passe n'est demandé.
    """
    import base64
    import hashlib
    import http.server
    import secrets
    import urllib.parse

    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    result = {}

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            u = urllib.parse.urlparse(self.path)
            if u.path != "/callback":
                self.send_response(404)
                self.end_headers()
                return
            q = urllib.parse.parse_qs(u.query)
            result["code"] = (q.get("code") or [None])[0]
            result["error"] = (q.get("error_description") or q.get("error") or [None])[0]
            ok = bool(result["code"])
            body = ("<h2>Connexion réussie.</h2><p>Vous pouvez fermer cet onglet et revenir dans Weechat.</p>" if ok
                    else "<h2>Connexion annulée.</h2><p>Revenez dans Weechat pour réessayer.</p>")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(f"<html><body style='font-family:sans-serif;text-align:center;padding:60px'>{body}</body></html>".encode())

        def log_message(self, *a):
            pass

    try:
        srv = http.server.HTTPServer(("127.0.0.1", GOOGLE_PORT), H)
    except OSError:
        raise AuthError("Le port de connexion est occupé. Fermez l'autre fenêtre Weechat et réessayez.")
    srv.timeout = 1
    params = urllib.parse.urlencode({"provider": "google", "redirect_to": GOOGLE_REDIRECT,
                                     "code_challenge": challenge, "code_challenge_method": "s256"})
    open_url(f"{URL}/auth/v1/authorize?{params}")
    import time as _t
    end = _t.time() + timeout
    try:
        while "code" not in result and _t.time() < end:
            srv.handle_request()
    finally:
        srv.server_close()
    if not result.get("code"):
        raise AuthError(result.get("error") or "Connexion Google non terminée. Réessayez.")
    s = _req("/auth/v1/token?grant_type=pkce", {"auth_code": result["code"], "code_verifier": verifier})
    _save(s)
    return s


def restore():
    """Reprend la session mémorisée ; None si absente ou expirée."""
    try:
        with open(_FILE, encoding="utf-8") as f:
            rt = json.load(f)["refresh_token"]
        s = _req("/auth/v1/token?grant_type=refresh_token", {"refresh_token": rt})
        _save(s)
        return s
    except (OSError, KeyError, ValueError, AuthError):
        return None


def sign_out():
    try:
        os.remove(_FILE)
    except OSError:
        pass


def balances(session):
    """Solde de points (Swap Live) et secondes audio, lus côté serveur."""
    tok = session["access_token"]
    totals = _req("/rest/v1/rpc/get_credit_totals", {}, tok) or []
    points = totals[0]["balance"] if totals else 0
    seconds = _req("/rest/v1/rpc/get_audio_seconds", {}, tok) or 0
    return int(points or 0), int(seconds or 0)


def has_license(session):
    """Licence Weechat Camera lue côté serveur (app_metadata, non modifiable par l'utilisateur)."""
    u = _req("/auth/v1/user", None, session["access_token"]) or {}
    return bool((u.get("app_metadata") or {}).get("camera_license"))


class ChargeError(Exception):
    def __init__(self, code, balance=None):
        super().__init__(code)
        self.code, self.balance = code, balance


def charge_block(session, service, session_id, block):
    """Débite un bloc de 10 s (tarif fixé par le serveur). Lève ChargeError si refusé."""
    body = json.dumps({"service": service, "sessionId": session_id, "block": block}).encode()
    req = urllib.request.Request(SITE + "/api/public/desktop-charge", data=body, method="POST",
                                 headers={"Content-Type": "application/json",
                                          "Authorization": f"Bearer {session['access_token']}"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())["balance"]
    except urllib.error.HTTPError as e:
        try:
            j = json.loads(e.read())
        except Exception:
            j = {}
        raise ChargeError(j.get("error") or ("unauthorized" if e.code == 401 else "failed"), j.get("balance"))
    except urllib.error.URLError:
        raise ChargeError("offline")


def wake_cloud(session):
    """Demande au site de réveiller le serveur GPU ; renvoie (url, état)."""
    req = urllib.request.Request(SITE + "/api/public/cloud-endpoint", data=b"{}", method="POST",
                                 headers={"Content-Type": "application/json",
                                          "Authorization": f"Bearer {session['access_token']}"})
    with urllib.request.urlopen(req, timeout=20) as r:
        j = json.loads(r.read())
        return j["url"], j.get("status", "ready")


def _ai(session, body, timeout=120):
    req = urllib.request.Request(SITE + "/api/public/desktop-ai", data=json.dumps(body).encode(), method="POST",
                                 headers={"Content-Type": "application/json",
                                          "Authorization": f"Bearer {session['access_token']}"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read())
        except Exception:
            return {"ok": False, "error": "unauthorized" if e.code == 401 else "failed"}
    except urllib.error.URLError:
        return {"ok": False, "error": "offline"}


def start_character_swap(session, video_path, photo_path):
    """Envoie vidéo (15 s max) + photo au serveur Weechat. Prix et durée fixés côté serveur."""
    import base64, mimetypes
    with open(video_path, "rb") as f:
        video = base64.b64encode(f.read()).decode()
    mime = mimetypes.guess_type(photo_path)[0] or "image/jpeg"
    if mime not in ("image/png", "image/jpeg", "image/webp"):
        mime = "image/jpeg"
    with open(photo_path, "rb") as f:
        photo = f"data:{mime};base64," + base64.b64encode(f.read()).decode()
    return _ai(session, {"action": "start", "video": video, "characterImage": photo}, timeout=300)


def character_swap_status(session, ticket):
    return _ai(session, {"action": "status", "ticket": ticket}, timeout=30)

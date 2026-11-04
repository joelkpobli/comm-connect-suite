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
SITE = "https://comm-connect-suite.lovable.app"
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
            msg = json.loads(e.read()).get("msg") or json.loads(e.read()).get("error_description")
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

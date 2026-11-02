"""Weechat Cloud Live — passerelle GPU (Option 1).

Reçoit la webcam du client Weechat en WebRTC, applique un moteur d'avatar,
renvoie le flux transformé. Aucun enregistrement : les images restent en mémoire.

Moteur : WEECHAT_ENGINE=passthrough (test réseau, renvoie l'image telle quelle,
annoncé comme tel) ou un module Python exposant `load()` et `process(frame_bgr)`.
Aucun moteur d'avatar complet n'est encore validé : le serveur ne prétend pas le contraire.
"""
import asyncio, importlib, json, logging, os, time
import aiohttp
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
from av import VideoFrame

log = logging.getLogger("weechat-gateway")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_KEY = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
ENGINE_NAME = os.environ.get("WEECHAT_ENGINE", "passthrough")
MAX_SESSIONS = int(os.environ.get("WEECHAT_MAX_SESSIONS", "2"))
pcs: set = set()


class Engine:
    def __init__(self, name):
        self.name = name
        self.mod = None if name == "passthrough" else importlib.import_module(name)
        if self.mod:
            self.mod.load()

    def process(self, bgr):
        return bgr if self.mod is None else self.mod.process(bgr)


ENGINE = None


class AvatarTrack(MediaStreamTrack):
    kind = "video"

    def __init__(self, source):
        super().__init__()
        self.source = source

    async def recv(self):
        frame = await self.source.recv()
        img = frame.to_ndarray(format="bgr24")
        out = await asyncio.get_running_loop().run_in_executor(None, ENGINE.process, img)
        nf = VideoFrame.from_ndarray(out, format="bgr24")
        nf.pts, nf.time_base = frame.pts, frame.time_base
        return nf


async def verify_user(token):
    """Vérifie le jeton de session Weechat auprès de Supabase ; renvoie l'id ou None."""
    if not (SUPABASE_URL and SUPABASE_KEY and token):
        return None
    async with aiohttp.ClientSession() as s:
        async with s.get(f"{SUPABASE_URL}/auth/v1/user",
                         headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"}) as r:
            if r.status != 200:
                return None
            return (await r.json()).get("id")


async def health(_):
    return web.json_response({"ok": True, "engine": ENGINE.name, "sessions": len(pcs),
                              "avatar_validated": ENGINE.name != "passthrough"})


async def offer(request):
    token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
    user = await verify_user(token)
    if not user:
        return web.json_response({"error": "unauthorized"}, status=401)
    if len(pcs) >= MAX_SESSIONS:
        return web.json_response({"error": "busy"}, status=503)
    body = await request.json()
    pc = RTCPeerConnection()
    pcs.add(pc)
    started = time.time()

    @pc.on("track")
    def on_track(track):
        if track.kind == "video":
            pc.addTrack(AvatarTrack(track))

    @pc.on("connectionstatechange")
    async def on_state():
        if pc.connectionState in ("failed", "closed", "disconnected"):
            log.info("session %s fin (%.0fs)", user, time.time() - started)
            pcs.discard(pc)
            await pc.close()

    await pc.setRemoteDescription(RTCSessionDescription(sdp=body["sdp"], type=body["type"]))
    await pc.setLocalDescription(await pc.createAnswer())
    return web.json_response({"sdp": pc.localDescription.sdp, "type": pc.localDescription.type})


async def on_shutdown(_):
    await asyncio.gather(*[pc.close() for pc in pcs])


def main():
    global ENGINE
    logging.basicConfig(level=logging.INFO)
    ENGINE = Engine(ENGINE_NAME)
    app = web.Application()
    app.router.add_get("/health", health)
    app.router.add_post("/offer", offer)
    app.on_shutdown.append(on_shutdown)
    web.run_app(app, port=int(os.environ.get("PORT", "8443")))


if __name__ == "__main__":
    main()

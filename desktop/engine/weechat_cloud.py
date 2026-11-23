"""Weechat Cloud Live — client : webcam → passerelle GPU → caméra virtuelle.

Usage : python weechat_cloud.py --server https://POD:8443 --token JETON [--camera 1]
"""
import argparse, asyncio, sys
import aiohttp, cv2
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from av import VideoFrame

import weechat_swap


class WebcamTrack(VideoStreamTrack):
    def __init__(self, cap):
        super().__init__()
        self.cap = cap

    async def recv(self):
        pts, tb = await self.next_timestamp()
        ok, img = await asyncio.get_running_loop().run_in_executor(None, self.cap.read)
        if not ok:
            raise RuntimeError("Webcam indisponible")
        f = VideoFrame.from_ndarray(img, format="bgr24")
        f.pts, f.time_base = pts, tb
        return f


async def run(server, token, camera="auto", log=print, stop=None, avatar=None, on_frame=None, avatar_file=None):
    cap, _ = weechat_swap.open_camera(str(camera), log)
    pc = RTCPeerConnection()
    pc.addTrack(WebcamTrack(cap))
    pc.addTransceiver("video", direction="sendrecv")
    done = asyncio.Event()

    @pc.on("track")
    def on_track(track):
        async def pump():
            vcam = None
            try:
                while not (stop and stop.is_set()):
                    frame = await track.recv()
                    img = frame.to_ndarray(format="rgb24")
                    if vcam is None:
                        vcam = weechat_swap.open_vcam(img.shape[1], img.shape[0], log)
                        log("Cloud Live connecté : flux envoyé à Weechat Camera.")
                    if vcam:
                        vcam.send(img)
                    if on_frame:
                        on_frame(cv2.cvtColor(img, cv2.COLOR_RGB2BGR), 25.0)
            finally:
                done.set()
        asyncio.ensure_future(pump())

    avatar_image = None
    if avatar_file:
        import base64
        img = cv2.imread(avatar_file)
        if img is None:
            raise RuntimeError("Photo d'avatar illisible.")
        h, w = img.shape[:2]
        if max(h, w) > 1024:
            k = 1024 / max(h, w); img = cv2.resize(img, (int(w * k), int(h * k)))
        avatar_image = base64.b64encode(cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 90])[1]).decode()
    await pc.setLocalDescription(await pc.createOffer())
    async with aiohttp.ClientSession() as s:
        async with s.post(server.rstrip("/") + "/offer",
                          json={"sdp": pc.localDescription.sdp, "type": pc.localDescription.type, "avatar": avatar, "avatar_image": avatar_image},
                          headers={"Authorization": f"Bearer {token}"}) as r:
            if r.status == 401:
                raise RuntimeError("Compte Weechat refusé : reconnectez-vous.")
            if r.status == 503:
                raise RuntimeError("Serveur Cloud occupé, réessayez dans un instant.")
            if r.status == 400:
                raise RuntimeError("Aucun visage détecté sur la photo d'avatar : choisissez un portrait net, de face.")
            r.raise_for_status()
            ans = await r.json()
    await pc.setRemoteDescription(RTCSessionDescription(**ans))
    log("Connexion au serveur Cloud en cours…")
    while not done.is_set() and not (stop and stop.is_set()):
        await asyncio.sleep(0.2)
    await pc.close()
    cap.release()


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--server", required=True)
    p.add_argument("--token", required=True)
    p.add_argument("--camera", default="auto")
    p.add_argument("--avatar", default=None)
    a = p.parse_args()
    try:
        asyncio.run(run(a.server, a.token, a.camera, avatar=a.avatar))
    except Exception as e:
        print("Erreur :", e, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

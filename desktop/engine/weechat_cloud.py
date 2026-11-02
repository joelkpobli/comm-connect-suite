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


async def run(server, token, camera="auto", log=print, stop=None):
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
                        log("Cloud Live connecté : flux envoyé à Unity Video Capture.")
                    if vcam:
                        vcam.send(img)
            finally:
                done.set()
        asyncio.ensure_future(pump())

    await pc.setLocalDescription(await pc.createOffer())
    async with aiohttp.ClientSession() as s:
        async with s.post(server.rstrip("/") + "/offer",
                          json={"sdp": pc.localDescription.sdp, "type": pc.localDescription.type},
                          headers={"Authorization": f"Bearer {token}"}) as r:
            if r.status == 401:
                raise RuntimeError("Compte Weechat refusé : reconnectez-vous.")
            if r.status == 503:
                raise RuntimeError("Serveur Cloud occupé, réessayez dans un instant.")
            r.raise_for_status()
            ans = await r.json()
    await pc.setRemoteDescription(RTCSessionDescription(**ans))
    log("Connexion au serveur Cloud en cours…")
    await done.wait()
    await pc.close()
    cap.release()


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--server", required=True)
    p.add_argument("--token", required=True)
    p.add_argument("--camera", default="auto")
    a = p.parse_args()
    try:
        asyncio.run(run(a.server, a.token, a.camera))
    except Exception as e:
        print("Erreur :", e, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

"""Arrête automatiquement le Pod RunPod quand aucun appel n'est actif.

Lancement sur le Pod :  nohup python3 idle_guard.py > idle.log 2>&1 &
Variables : IDLE_SECONDS (défaut 60), GRACE_SECONDS (défaut 300 au démarrage), PORT (8888).
RunPod fournit RUNPOD_POD_ID et la commande runpodctl dans chaque Pod.
"""
import json, os, subprocess, time, urllib.request

PORT = os.environ.get("PORT", "8888")
IDLE = int(os.environ.get("IDLE_SECONDS", "60"))
GRACE = int(os.environ.get("GRACE_SECONDS", "300"))
POD = os.environ.get("RUNPOD_POD_ID")

def sessions() -> int:
    try:
        with urllib.request.urlopen(f"http://localhost:{PORT}/health", timeout=5) as r:
            return int(json.load(r).get("sessions", 0))
    except Exception:
        return 0

start = time.time(); idle_since = time.time()
while True:
    if sessions() > 0:
        idle_since = time.time()
    elif time.time() - start > GRACE and time.time() - idle_since > IDLE:
        print("Aucun appel actif : arrêt du Pod", POD, flush=True)
        if POD:
            subprocess.run(["runpodctl", "stop", "pod", POD])
        break
    time.sleep(10)

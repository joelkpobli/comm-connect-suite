# Image pour RunPod / Vast.ai (GPU NVIDIA). Facturé uniquement quand le pod tourne.
FROM nvidia/cuda:12.2.2-cudnn8-runtime-ubuntu22.04
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt
COPY server.py .
ENV PORT=8443 WEECHAT_ENGINE=passthrough
EXPOSE 8443
CMD ["python3", "server.py"]

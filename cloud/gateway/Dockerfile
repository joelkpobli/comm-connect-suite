# Image GPU (RunPod / Vast.ai). Facturé uniquement quand le pod tourne.
FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip git git-lfs ffmpeg libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt \
 && pip3 install --no-cache-dir torch==2.3.0 torchvision==0.18.0 --index-url https://download.pytorch.org/whl/cu121
# Moteur LivePortrait (MIT) + poids publics
RUN git clone --depth 1 https://github.com/KwaiVGI/LivePortrait /opt/LivePortrait \
 && pip3 install --no-cache-dir -r /opt/LivePortrait/requirements_base.txt onnxruntime-gpu huggingface_hub \
 && python3 -c "from huggingface_hub import snapshot_download; snapshot_download('KwaiVGI/LivePortrait', local_dir='/opt/LivePortrait/pretrained_weights', allow_patterns=['*.pth','*.onnx','*.json'])"
COPY server.py liveportrait_engine.py ./
COPY avatars/ /app/avatars/
ENV PORT=8443 WEECHAT_ENGINE=liveportrait_engine LIVEPORTRAIT_DIR=/opt/LivePortrait
EXPOSE 8443
CMD ["python3", "server.py"]

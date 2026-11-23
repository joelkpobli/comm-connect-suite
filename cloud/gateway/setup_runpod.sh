#!/usr/bin/env bash
# Installe le moteur d'avatar LivePortrait (MIT) sur le pod RunPod, puis lance la passerelle.
set -e
cd /workspace
PIP="pip install --break-system-packages --ignore-installed -q"
$PIP -r /workspace/weechat/cloud/gateway/requirements.txt
if [ ! -d /workspace/LivePortrait ]; then
  git clone --depth 1 https://github.com/KwaiVGI/LivePortrait /workspace/LivePortrait
fi
$PIP -r /workspace/LivePortrait/requirements_base.txt onnxruntime-gpu huggingface_hub
python3 -c "from huggingface_hub import snapshot_download; snapshot_download('KwaiVGI/LivePortrait', local_dir='/workspace/LivePortrait/pretrained_weights', allow_patterns=['*.pth','*.onnx','*.json'])"
pkill -9 -f jupyter || true
cd /workspace/weechat/cloud/gateway
PORT=8888 WEECHAT_ENGINE=liveportrait_engine LIVEPORTRAIT_DIR=/workspace/LivePortrait \
WEECHAT_AVATAR_DIR=/workspace/weechat/cloud/gateway/avatars python3 server.py

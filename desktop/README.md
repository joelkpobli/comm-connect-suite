# Weechat Companion (Windows) — squelette Tauri v2

Statut : **squelette, non compilé ni testé**. Il se construit sur un PC Windows, pas dans Lovable.

## Construire sur Windows
1. Installer Rust (https://rustup.rs) et les « Microsoft C++ Build Tools ».
2. `cargo install tauri-cli --version "^2"`
3. Placer une icône `desktop/src-tauri/icons/icon.ico`.
4. Dans `desktop/src-tauri` : `cargo tauri dev` (essai) puis `cargo tauri build` → `Weechat_0.1.0_x64-setup.exe`.

## Ce que fait cette version
- Ouvre Weechat (page Swap Live publiée) dans une fenêtre Windows légère (WebView2).
- Expose `virtual_camera_status` qui répond honnêtement « non installée ».

## Étapes suivantes
- 5.2 Caméra virtuelle `Weechat Virtual Camera` (Media Foundation Win11, DirectShow Win10).
- 5.3 Envoi du rendu Swap Live vers la caméra virtuelle.
- 5.4 Installeur final signé ou non (avertissement SmartScreen sans certificat).

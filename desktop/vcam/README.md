# weechat-vcam.dll — pilote « Weechat Virtual Camera »

Statut : **source préparée, non compilée, non testée** (se construit uniquement sur Windows).

Base : [softcam](https://github.com/tshino/softcam) (licence MIT, gratuit), filtre DirectShow
en mode utilisateur, Windows 10 et 11, reconnu par Zoom, Teams, Meet (Chrome/Edge), Discord,
OBS. WhatsApp Desktop récent (Media Foundation) : **à vérifier en test réel**.

## Construire (PC Windows, Visual Studio 2022 « Développement C++ »)
1. `git clone https://github.com/tshino/softcam` dans `desktop/vcam/softcam`.
2. Copier `weechat_vcam.cpp` dans `softcam/examples/softcam_installer/` n'est pas nécessaire :
   ouvrir `softcam/src/softcam/softcam.cpp` et remplacer le nom et le CLSID par ceux de
   `weechat_vcam.cpp` (nom `Weechat Virtual Camera`, CLSID `{6E8C4F2A-9B3D-4E71-A5C2-7D1F0B8E3A64}`).
3. Compiler `softcam.sln` en **Release x64** → renommer `softcam.dll` en `weechat-vcam.dll`.
4. Placer `weechat-vcam.dll` dans `desktop/src-tauri/` ; il est copié à côté de l'exécutable
   (`bundle.resources` dans `tauri.conf.json`).

## Fonctionnement
- Installer : l'application lance `regsvr32 weechat-vcam.dll` (fenêtre administrateur, une fois).
- Diffuser : `scCreateCamera(1280, 720, 30)` puis `scSendFrame` pour chaque image Swap Live.
- Statut : lu dans le registre `HKCR\CLSID\{…}` — aucun « actif » sans preuve.
- Désinstaller : `regsvr32 /u`.

## Test de validation (à faire et noter dans docs/WINDOWS_VIRTUAL_DEVICES.md §8)
1. Installer depuis l'application, ouvrir Swap Live, démarrer la diffusion.
2. Dans Zoom/Teams/WhatsApp : choisir « Weechat Virtual Camera » et vérifier l'image.

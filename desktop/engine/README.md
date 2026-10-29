# Moteur Weechat Swap Live (local, Windows 11)

Vrai face swap IA (InsightFace `inswapper_128`) exécuté sur votre PC via ONNX Runtime **DirectML** :
fonctionne sans carte NVIDIA (GPU intégré Intel/AMD), ~5–12 img/s attendues. Rien n'est envoyé ni enregistré.

## Installation (une fois)
1. Installer **Python 3.10** (python.org, cocher « Add to PATH »).
2. Installer **Microsoft C++ Build Tools** (option « Développement Desktop C++ ») — requis par insightface.
3. Double-cliquer `installer.bat`.

## Utilisation
1. Double-cliquer `demarrer.bat`, glisser une photo de visage (de face, nette, droits obtenus).
2. Le modèle (~530 Mo) se télécharge au premier lancement.
3. Dans WhatsApp / Zoom / TikTok Live Studio, choisir la caméra **OBS Virtual Camera**
   (pyvirtualcam utilise ce pilote déjà installé ; la future DLL Weechat le remplacera).

Options : `--det-size 640` (plus précis, plus lent), `--no-vcam` (aperçu seul), `--camera 1`.

## Statut
Non testé sur Windows depuis l'environnement de développement : à valider sur votre PC (noter les img/s affichées).

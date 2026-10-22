# Application Windows native — caméra et micro virtuels

Statut : **non construit**. Rien ne peut être réalisé depuis le navigateur.

## Application compagnon
- Windows 11, application native (C++/C# ou Rust) signée (certificat de signature de code, ~200–400 €/an, non engagé).
- Reçoit l'audio traduit et la vidéo d'avatar depuis Weechat (WebRTC local ou socket loopback).

## Caméra virtuelle
- API `MFCreateVirtualCamera` (Windows 11 build 22000+), source Media Foundation enregistrée en COM.
- Pas de pilote noyau requis ; la DLL source doit être signée.
- Alternative sans OBS : cette API remplace la caméra virtuelle OBS.

## Micro virtuel
- Exige un pilote audio virtuel (kernel ou APO) signé via le programme WHQL / attestation Microsoft (compte Partner Center, EV certificate).
- Alternative : pilote tiers sous licence (ex. VB-CABLE, licence commerciale à négocier).

## Compatibilité
Aucune compatibilité WhatsApp Desktop, Instagram (web), Messenger, Teams ou Zoom n'est revendiquée avant installation et test réels sur la machine cible.

//! Caméra virtuelle « Weechat Virtual Camera ».
//! Étape 5.2 : Windows 11 via MFCreateVirtualCamera, Windows 10 via filtre DirectShow.
//! Tant que ce module n'est pas implémenté, il renvoie « non installée » — jamais un faux succès.

use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CameraStatus {
    pub installed: bool,
    pub streaming: bool,
    pub backend: &'static str,
    pub message: &'static str,
}

pub fn status() -> CameraStatus {
    CameraStatus {
        installed: false,
        streaming: false,
        backend: "none",
        message: "Caméra virtuelle pas encore construite (étape 5.2).",
    }
}

mod virtual_camera;

use virtual_camera::CameraStatus;

/// Indique à l'interface web l'état réel de la caméra virtuelle.
/// Aucun état « actif » n'est renvoyé tant que le pilote n'existe pas.
#[tauri::command]
fn virtual_camera_status() -> CameraStatus {
    virtual_camera::status()
}

#[tauri::command]
fn companion_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![virtual_camera_status, companion_version])
        .run(tauri::generate_context!())
        .expect("échec du lancement de Weechat Companion");
}

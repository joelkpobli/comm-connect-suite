mod virtual_camera;

use virtual_camera::CameraStatus;

/// État réel lu dans Windows (registre + diffusion), jamais supposé.
#[tauri::command]
fn virtual_camera_status() -> CameraStatus {
    virtual_camera::status()
}

#[tauri::command]
fn virtual_camera_install() -> Result<CameraStatus, String> {
    virtual_camera::install()?;
    Ok(virtual_camera::status())
}

#[tauri::command]
fn virtual_camera_uninstall() -> Result<CameraStatus, String> {
    virtual_camera::uninstall()?;
    Ok(virtual_camera::status())
}

#[tauri::command]
fn virtual_camera_start() -> Result<CameraStatus, String> {
    virtual_camera::start()?;
    Ok(virtual_camera::status())
}

/// Reçoit une image 1280x720 RGB (octets bruts) depuis le canvas Swap Live.
#[tauri::command]
fn virtual_camera_push(request: tauri::ipc::Request) -> Result<(), String> {
    match request.body() {
        tauri::ipc::InvokeBody::Raw(bytes) => virtual_camera::push(bytes),
        _ => Err("Image attendue en octets bruts.".into()),
    }
}

#[tauri::command]
fn virtual_camera_stop() -> CameraStatus {
    virtual_camera::stop();
    virtual_camera::status()
}

#[tauri::command]
fn companion_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            virtual_camera_status,
            virtual_camera_install,
            virtual_camera_uninstall,
            virtual_camera_start,
            virtual_camera_push,
            virtual_camera_stop,
            companion_version
        ])
        .on_window_event(|_, e| {
            if let tauri::WindowEvent::Destroyed = e {
                virtual_camera::stop();
            }
        })
        .run(tauri::generate_context!())
        .expect("échec du lancement de Weechat Companion");
}

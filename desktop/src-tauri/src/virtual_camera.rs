//! Caméra virtuelle « Weechat Virtual Camera ».
//!
//! Pilote : DLL DirectShow `weechat-vcam.dll`, construite depuis la bibliothèque libre
//! softcam (MIT, https://github.com/tshino/softcam) renommée « Weechat Virtual Camera »
//! (voir desktop/vcam/README.md). Elle fonctionne sous Windows 10 et 11 en mode utilisateur.
//!
//! Flux : l'interface Swap Live envoie des images RGB 1280x720 -> `push_frame`
//! -> `scSendFrame` (mémoire partagée de la DLL) -> l'application d'appel.
//! Règle : l'état « installée » est lu dans le registre Windows, jamais supposé.

use serde::Serialize;

pub const CAMERA_NAME: &str = "Weechat Virtual Camera";
pub const WIDTH: u32 = 1280;
pub const HEIGHT: u32 = 720;
/// CLSID du filtre (doit correspondre à desktop/vcam/weechat_vcam.cpp).
pub const CLSID: &str = "{6E8C4F2A-9B3D-4E71-A5C2-7D1F0B8E3A64}";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CameraStatus {
    pub installed: bool,
    pub streaming: bool,
    pub dll_found: bool,
    pub backend: &'static str,
    pub message: String,
}

#[cfg(windows)]
mod win {
    use super::*;
    use libloading::{Library, Symbol};
    use std::path::PathBuf;
    use std::process::Command;
    use std::sync::Mutex;

    type CreateCam = unsafe extern "C" fn(i32, i32, f32) -> *mut core::ffi::c_void;
    type DeleteCam = unsafe extern "C" fn(*mut core::ffi::c_void);
    type SendFrame = unsafe extern "C" fn(*mut core::ffi::c_void, *const u8);

    struct Stream {
        _lib: Library,
        cam: *mut core::ffi::c_void,
        send: SendFrame,
        delete: DeleteCam,
    }
    unsafe impl Send for Stream {}

    static STREAM: Mutex<Option<Stream>> = Mutex::new(None);

    pub fn dll_path() -> PathBuf {
        std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|d| d.join("weechat-vcam.dll")))
            .unwrap_or_else(|| PathBuf::from("weechat-vcam.dll"))
    }

    pub fn registered() -> bool {
        let key = format!(r"HKCR\CLSID\{}\InprocServer32", CLSID);
        Command::new("reg").args(["query", &key]).output().map(|o| o.status.success()).unwrap_or(false)
    }

    pub fn streaming() -> bool {
        STREAM.lock().map(|s| s.is_some()).unwrap_or(false)
    }

    /// Enregistrement : demande les droits administrateur (UAC) une seule fois.
    pub fn register(install: bool) -> Result<(), String> {
        let dll = dll_path();
        if !dll.exists() {
            return Err(format!("Fichier pilote introuvable : {}", dll.display()));
        }
        let args = if install {
            format!("/s \"{}\"", dll.display())
        } else {
            format!("/u /s \"{}\"", dll.display())
        };
        let ps = format!("Start-Process regsvr32 -ArgumentList '{}' -Verb RunAs -Wait", args.replace('\'', "''"));
        let ok = Command::new("powershell").args(["-NoProfile", "-Command", &ps]).status().map(|s| s.success()).unwrap_or(false);
        if !ok {
            return Err("Enregistrement refusé ou échoué (droits administrateur requis).".into());
        }
        if registered() != install {
            return Err("Windows n'a pas confirmé l'opération.".into());
        }
        Ok(())
    }

    pub fn start() -> Result<(), String> {
        let mut guard = STREAM.lock().map_err(|_| "verrou")?;
        if guard.is_some() {
            return Ok(());
        }
        if !registered() {
            return Err("Caméra virtuelle non installée.".into());
        }
        unsafe {
            let lib = Library::new(dll_path()).map_err(|e| e.to_string())?;
            let create: Symbol<CreateCam> = lib.get(b"scCreateCamera").map_err(|e| e.to_string())?;
            let send: Symbol<SendFrame> = lib.get(b"scSendFrame").map_err(|e| e.to_string())?;
            let delete: Symbol<DeleteCam> = lib.get(b"scDeleteCamera").map_err(|e| e.to_string())?;
            let cam = create(WIDTH as i32, HEIGHT as i32, 30.0);
            if cam.is_null() {
                return Err("Une autre application utilise déjà la caméra virtuelle.".into());
            }
            let (send, delete) = (*send, *delete);
            *guard = Some(Stream { _lib: lib, cam, send, delete });
        }
        Ok(())
    }

    pub fn push(rgb: &[u8]) -> Result<(), String> {
        if rgb.len() != (WIDTH * HEIGHT * 3) as usize {
            return Err("Taille d'image incorrecte (1280x720 RGB attendu).".into());
        }
        let guard = STREAM.lock().map_err(|_| "verrou")?;
        let s = guard.as_ref().ok_or("Diffusion non démarrée.")?;
        unsafe { (s.send)(s.cam, rgb.as_ptr()) };
        Ok(())
    }

    pub fn stop() {
        if let Ok(mut g) = STREAM.lock() {
            if let Some(s) = g.take() {
                unsafe { (s.delete)(s.cam) };
            }
        }
    }
}

#[cfg(windows)]
pub fn status() -> CameraStatus {
    let installed = win::registered();
    let streaming = win::streaming();
    let dll_found = win::dll_path().exists();
    let message = match (dll_found, installed, streaming) {
        (false, _, _) => "Fichier pilote absent de l'installation.".to_string(),
        (true, false, _) => "Caméra virtuelle non installée.".to_string(),
        (true, true, false) => format!("« {CAMERA_NAME} » installée, en attente d'images."),
        (true, true, true) => format!("« {CAMERA_NAME} » diffuse votre Swap Live."),
    };
    CameraStatus { installed, streaming, dll_found, backend: "directshow", message }
}
#[cfg(windows)]
pub fn install() -> Result<(), String> { win::register(true) }
#[cfg(windows)]
pub fn uninstall() -> Result<(), String> { win::stop(); win::register(false) }
#[cfg(windows)]
pub fn start() -> Result<(), String> { win::start() }
#[cfg(windows)]
pub fn push(rgb: &[u8]) -> Result<(), String> { win::push(rgb) }
#[cfg(windows)]
pub fn stop() { win::stop() }

#[cfg(not(windows))]
const UNSUPPORTED: &str = "La caméra virtuelle n'existe que sous Windows.";
#[cfg(not(windows))]
pub fn status() -> CameraStatus {
    CameraStatus { installed: false, streaming: false, dll_found: false, backend: "none", message: UNSUPPORTED.into() }
}
#[cfg(not(windows))]
pub fn install() -> Result<(), String> { Err(UNSUPPORTED.into()) }
#[cfg(not(windows))]
pub fn uninstall() -> Result<(), String> { Err(UNSUPPORTED.into()) }
#[cfg(not(windows))]
pub fn start() -> Result<(), String> { Err(UNSUPPORTED.into()) }
#[cfg(not(windows))]
pub fn push(_rgb: &[u8]) -> Result<(), String> { Err(UNSUPPORTED.into()) }
#[cfg(not(windows))]
pub fn stop() {}

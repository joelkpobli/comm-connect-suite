// Masque la console Windows en version publiée.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    weechat_companion_lib::run()
}

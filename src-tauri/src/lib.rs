// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::{
  env,
  time::{SystemTime, UNIX_EPOCH},
};
#[allow(unused_imports)]
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      let handle = app.handle().clone();
      tauri::async_runtime::block_on(async move {
        setup(&handle).await;
      });
      Ok(())
    })
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![greet])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[allow(unused_variables)]
async fn setup<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
  init_log();
  #[cfg(debug_assertions)]
  {
    let app_data_dir = app.app_handle().path().app_data_dir().unwrap();
    log::debug!("app_data_dir={}", app_data_dir.display());
  }
}

fn init_log() {
  env_logger::try_init().expect("error initializing log");
}

#[tauri::command]
fn greet() -> String {
  let now = SystemTime::now();
  let epoch_ms = now.duration_since(UNIX_EPOCH).unwrap().as_millis();
  format!("Current timestamp from Rust: {epoch_ms}ms")
}

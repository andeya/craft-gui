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
    // app.get_webview_window("main").unwrap().open_devtools();
    log::debug!(
      "app_data_dir={}",
      app.app_handle().path().app_data_dir().unwrap().display()
    );
  }
}

fn init_log() {
  env_logger::try_init().expect("error initializing log");
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello {}! You've been greeted from Rust!", name)
}

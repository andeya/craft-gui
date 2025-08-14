mod config;
mod storage;
pub use config::get_config;

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
    .invoke_handler(tauri::generate_handler![
      config::cfg_cmd_get_schema,
      config::cfg_cmd_get_data,
      config::cfg_cmd_save_data,
      greet,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[allow(unused_variables)]
async fn setup<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
  let mut exit_code = 0;
  if let Err(e) = init_log() {
    eprintln!("Failed to initialize log: {}", e);
    log::error!("Failed to initialize log: {}", e);
    exit_code = 1;
  }
  let app_data_dir = match app.app_handle().path().app_data_dir() {
    Ok(dir) => dir,
    Err(e) => {
      log::error!("Failed to get app data dir: {}", e);
      exit_code = 2;
      app.exit(exit_code);
      return;
    }
  };

  #[cfg(debug_assertions)]
  {
    log::debug!("app_data_dir={}", app_data_dir.display());
  }

  if let Err(e) = config::setup(app_data_dir.clone()).await {
    log::error!("Failed to setup config: {}", e);
    exit_code = 3;
  }
  if let Err(e) = storage::init(app_data_dir).await {
    log::error!("Failed to initialize storage: {}", e);
    exit_code = 4;
  }
  if exit_code != 0 {
    log::error!("Setup failed with exit code {}", exit_code);
    app.exit(exit_code);
  } else {
    log::info!("Setup complete");
  }
}

fn init_log() -> Result<(), log::SetLoggerError> {
  env_logger::try_init()
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello {}! You've been greeted from Rust!", name)
}

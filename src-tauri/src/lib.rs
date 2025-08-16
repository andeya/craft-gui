mod appdata;
pub mod config;
mod storage;
mod test;
pub use appdata::AppData;
pub use config::get_config;
pub use storage::sled_db;

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
      appdata::appdata_cmd_schema_ids,
      appdata::appdata_cmd_schemas,
      appdata::appdata_cmd_get_schema,
      appdata::appdata_cmd_get_data,
      appdata::appdata_cmd_save_data,
      appdata::appdata_cmd_remove_data,
      appdata::appdata_cmd_exists_data,
      appdata::appdata_cmd_find_next_available_key,
      greet,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[allow(unused_variables)]
async fn setup<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
  if let Err(e) = init_log() {
    eprintln!("Failed to initialize log: {}", e);
    log::error!("Failed to initialize log: {}", e);
    app.exit(1);
    return;
  }
  let app_data_dir = match app.app_handle().path().app_data_dir() {
    Ok(dir) => dir,
    Err(e) => {
      log::error!("Failed to get app data dir: {}", e);
      app.exit(2);
      return;
    }
  };

  #[cfg(debug_assertions)]
  {
    log::debug!("app_data_dir={}", app_data_dir.display());
  }

  if let Err(e) = storage::init(app_data_dir).await {
    log::error!("Failed to initialize storage: {}", e);
    app.exit(3);
    return;
  }
  if let Err(e) = register_all_appdata().await {
    log::error!("Failed to register all appdata: {}", e);
    app.exit(4);
    return;
  }
  if let Err(e) = config::init_config() {
    log::error!("Failed to initialize config: {}", e);
    app.exit(5);
    return;
  }
  log::info!("Setup complete");
}

fn init_log() -> Result<(), log::SetLoggerError> {
  env_logger::try_init()
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello {}! You've been greeted from Rust!", name)
}

async fn register_all_appdata() -> anyhow::Result<()> {
  config::AppConfig::register().await?;
  test::ProductConfig::register().await?;
  test::SystemSettings::register().await?;
  test::UserProfile::register().await?;
  Ok(())
}

#[cfg(test)]
mod tests {
  use super::*;

  #[tokio::test]
  async fn test_register_all_appdata() {
    let result = register_all_appdata().await;
    assert!(result.is_ok());
  }
}

mod apppath;
mod data;
pub use apppath::{path_resolver, PathResolver};
pub use data::*;

use crate::{appdata::AppData, sled_db};
use aarc::{Arc, AtomicArc, Guard};
use reindeer::{AsBytes, Entity};
use std::sync::{Mutex, OnceLock};

#[tauri::command]
pub async fn config_cmd_path_resolver() -> &'static PathResolver {
  path_resolver()
}

impl Entity for AppConfig {
  type Key = u32;

  fn store_name() -> &'static str {
    "AppConfig"
  }
  fn get_key(&self) -> &Self::Key {
    &0
  }
  fn set_key(&mut self, _key: &Self::Key) {}

  fn save(&self, db: &reindeer::Db) -> reindeer::Result<()> {
    save_db(self, db)?;
    set_config(self.clone());
    Ok(())
  }
}

fn save_db(config: &AppConfig, db: &reindeer::Db) -> reindeer::Result<()> {
  AppConfig::get_tree(db)?.insert(
    &config.get_key().as_bytes(),
    reindeer::bincode_serialize(config)?,
  )?;
  Ok(())
}

static CONFIG: OnceLock<AtomicArc<AppConfig>> = OnceLock::new();

pub fn init_config<R: tauri::Runtime>(
  path_resolver: &tauri::path::PathResolver<R>,
) -> Result<(), String> {
  apppath::init_path_resolver(path_resolver);
  let config = AppConfig::get_data(&0)?;
  let config = if let Some(config) = config {
    config
  } else {
    let config = AppConfig::default();
    save_db(&config, sled_db()).map_err(|e| format!("Failed to create config: {:?}", e))?;
    config
  };
  CONFIG
    .set(AtomicArc::new(config))
    .map_err(|e| format!("AppConfig already initialized: {:?}", *e.load().unwrap()))?;
  on_change(&get_config());
  Ok(())
}

pub fn get_config() -> Guard<AppConfig> {
  CONFIG.get().unwrap().load().unwrap()
}

pub fn load_config() -> Result<Arc<AppConfig>, String> {
  let config = AppConfig::get_data(&0)?.ok_or("Config not found")?;
  Ok(set_config(config))
}

pub fn save_config(config: &AppConfig) -> Result<(), String> {
  config.save_data()
}

fn set_config(config: AppConfig) -> Arc<AppConfig> {
  let config = Arc::new(config);
  CONFIG.get().unwrap().store(Some(&config));
  on_change(&config);
  config
}

static WATCHER: Mutex<Vec<for<'a> fn(&'a AppConfig)>> = Mutex::new(vec![]);

pub fn watch(f: for<'a> fn(&'a AppConfig)) {
  WATCHER.lock().unwrap().push(f);
}

fn on_change(config: &AppConfig) {
  let watchers = WATCHER.lock().unwrap();
  for f in watchers.as_slice() {
    f(config);
  }
}

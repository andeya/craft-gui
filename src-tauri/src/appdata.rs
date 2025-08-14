use reindeer::Entity;
use schemars::JsonSchema;
use serde::{de::DeserializeOwned, Serialize};
use std::borrow::Cow;
use std::collections::HashMap;
use std::fs::File;
use std::sync::{Arc, LazyLock};
use tokio::sync::RwLock;

use crate::sled_db;

pub trait AppData: JsonSchema + Serialize + DeserializeOwned + Entity<Key = i32> {
  fn get_schema() -> schemars::Schema {
    schemars::schema_for!(Self)
  }
  fn get_data(key: &i32) -> Result<Option<Self>, String> {
    Self::get(key, sled_db()).map_err(|e| e.to_string())
  }
  fn save_data(&self) -> Result<(), String> {
    self.save(sled_db()).map_err(|e| e.to_string())
  }
  fn remove_data(key: &i32) -> Result<(), String> {
    Self::remove(key, sled_db()).map_err(|e| e.to_string())
  }
  fn export_data(f: File) -> Result<(), String> {
    Self::export_json(f, true, sled_db()).map_err(|e| e.to_string())
  }
  fn import_data(f: File) -> Result<(), String> {
    Self::import_json(f, sled_db()).map_err(|e| e.to_string())
  }
  fn exists_data(key: &i32) -> Result<bool, String> {
    Self::exists(key, sled_db()).map_err(|e| e.to_string())
  }
}

impl<T: JsonSchema + Serialize + DeserializeOwned + Entity<Key = i32>> AppData for T {}

pub trait AppDataDyn {
  fn schema_name(&self) -> Cow<'static, str>;
  fn get_schema(&self) -> schemars::Schema;
  fn get_data(&self, key: i32) -> Result<Option<Vec<u8>>, String>;
  fn save_data(&self, data: &[u8]) -> Result<(), String>;
  fn remove_data(&self, key: i32) -> Result<(), String>;
  fn exists_data(&self, key: i32) -> Result<bool, String>;
}

impl<T: AppData + Send + Sync> AppDataDyn for T {
  fn schema_name(&self) -> Cow<'static, str> {
    T::schema_name()
  }
  fn get_schema(&self) -> schemars::Schema {
    T::get_schema()
  }

  fn get_data(&self, key: i32) -> Result<Option<Vec<u8>>, String> {
    T::get_data(&key).and_then(|data_opt| match data_opt {
      Some(data) => Ok(Some(serde_json::to_vec(&data).map_err(|e| e.to_string())?)),
      None => Ok(None),
    })
  }

  fn save_data(&self, data: &[u8]) -> Result<(), String> {
    let data: T = serde_json::from_slice(data).map_err(|e| e.to_string())?;
    data.save_data().map_err(|e| e.to_string())
  }

  fn remove_data(&self, key: i32) -> Result<(), String> {
    T::remove_data(&key)
  }

  fn exists_data(&self, key: i32) -> Result<bool, String> {
    T::exists_data(&key)
  }
}

static REGISTERED_APPDATA: LazyLock<RwLock<HashMap<String, Arc<dyn AppDataDyn + Send + Sync>>>> =
  LazyLock::new(|| RwLock::new(HashMap::new()));

pub async fn register<T: AppDataDyn + Send + Sync + 'static>(appdata: T) -> anyhow::Result<()> {
  let key = appdata.schema_name();
  REGISTERED_APPDATA
    .write()
    .await
    .insert(key.to_string(), Arc::new(appdata));
  Ok(())
}

async fn get(schema_name: &str) -> Option<Arc<dyn AppDataDyn + Send + Sync>> {
  REGISTERED_APPDATA.read().await.get(schema_name).cloned()
}

async fn get_ok(schema_name: &str) -> Result<Arc<dyn AppDataDyn + Send + Sync>, String> {
  get(schema_name)
    .await
    .ok_or(format!("AppData not found: {}", schema_name))
}

#[tauri::command]
pub async fn appdata_cmd_get_schema(schema_name: &str) -> Result<schemars::Schema, String> {
  get_ok(schema_name)
    .await
    .and_then(|appdata| Ok(appdata.get_schema()))
}

#[tauri::command]
pub async fn appdata_cmd_get_data(schema_name: &str, key: i32) -> Result<Option<Vec<u8>>, String> {
  get_ok(schema_name)
    .await
    .and_then(|appdata| appdata.get_data(key))
}

#[tauri::command]
pub async fn appdata_cmd_save_data(schema_name: &str, data: &[u8]) -> Result<(), String> {
  get_ok(schema_name)
    .await
    .and_then(|appdata| appdata.save_data(data))
}

#[tauri::command]
pub async fn appdata_cmd_remove_data(schema_name: &str, key: i32) -> Result<(), String> {
  get_ok(schema_name)
    .await
    .and_then(|appdata| appdata.remove_data(key))
}

#[tauri::command]
pub async fn appdata_cmd_exists_data(schema_name: &str, key: i32) -> Result<bool, String> {
  get_ok(schema_name)
    .await
    .and_then(|appdata| appdata.exists_data(key))
}

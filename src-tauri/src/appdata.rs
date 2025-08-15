use reindeer::Entity;
use schemars::JsonSchema;
use std::collections::HashMap;
use std::fs::File;
use std::sync::{Arc, LazyLock};
use tokio::sync::RwLock;

use crate::sled_db;

pub trait AppData: Default + Sync + Send + JsonSchema + Entity<Key = u32> + 'static {
  fn register() -> impl std::future::Future<Output = anyhow::Result<()>> + Send {
    register::<Self>()
  }
  fn id() -> &'static str {
    <Self as Entity>::store_name()
  }
  fn get_schema() -> schemars::Schema {
    schemars::schema_for!(Self)
  }
  fn get_data(key: &u32) -> Result<Option<Self>, String>
  where
    Self: Sized,
  {
    Self::get(key, sled_db()).map_err(|e| e.to_string())
  }
  fn save_data(&self) -> Result<(), String> {
    self.save(sled_db()).map_err(|e| e.to_string())
  }
  fn remove_data(key: &u32) -> Result<(), String> {
    Self::remove(key, sled_db()).map_err(|e| e.to_string())
  }
  fn export_data(f: File) -> Result<(), String> {
    Self::export_json(f, true, sled_db()).map_err(|e| e.to_string())
  }
  fn import_data(f: File) -> Result<(), String> {
    Self::import_json(f, sled_db()).map_err(|e| e.to_string())
  }
  fn exists_data(key: &u32) -> Result<bool, String> {
    Self::exists(key, sled_db()).map_err(|e| e.to_string())
  }
  fn find_next_available_key(start_key: u32) -> Result<u32, String> {
    let mut key = start_key;
    loop {
      if !Self::exists(&key, sled_db()).map_err(|e| e.to_string())? {
        return Ok(key);
      }
      key = key.checked_add(1).ok_or("Key overflow")?;
    }
  }
}

impl<T: Default + Sync + Send + JsonSchema + Entity<Key = u32> + 'static> AppData for T {}

pub trait AppDataDyn {
  fn id(&self) -> &'static str;
  fn get_schema(&self) -> schemars::Schema;
  fn get_data(&self, key: u32) -> Result<Option<Vec<u8>>, String>;
  fn save_data(&self, data: &[u8]) -> Result<(), String>;
  fn remove_data(&self, key: u32) -> Result<(), String>;
  fn exists_data(&self, key: u32) -> Result<bool, String>;
  fn find_next_available_key(&self, start_key: u32) -> Result<u32, String>;
}

impl<T: AppData> AppDataDyn for T {
  fn id(&self) -> &'static str {
    <T as AppData>::id()
  }
  fn get_schema(&self) -> schemars::Schema {
    <T as AppData>::get_schema()
  }

  fn get_data(&self, key: u32) -> Result<Option<Vec<u8>>, String> {
    <T as AppData>::get_data(&key).and_then(|data_opt| match data_opt {
      Some(data) => Ok(Some(serde_json::to_vec(&data).map_err(|e| e.to_string())?)),
      None => Ok(None),
    })
  }

  fn save_data(&self, data: &[u8]) -> Result<(), String> {
    let data: T = serde_json::from_slice(data).map_err(|e| e.to_string())?;
    <T as AppData>::save_data(&data).map_err(|e| e.to_string())
  }

  fn remove_data(&self, key: u32) -> Result<(), String> {
    <T as AppData>::remove_data(&key)
  }

  fn exists_data(&self, key: u32) -> Result<bool, String> {
    <T as AppData>::exists_data(&key)
  }

  fn find_next_available_key(&self, start_key: u32) -> Result<u32, String> {
    <T as AppData>::find_next_available_key(start_key)
  }
}

static REGISTERED_APPDATA: LazyLock<RwLock<HashMap<String, Arc<dyn AppDataDyn + Send + Sync>>>> =
  LazyLock::new(|| RwLock::new(HashMap::new()));

pub async fn register<T: AppData>() -> anyhow::Result<()> {
  let appdata = T::default();
  let key = appdata.id();
  let old = REGISTERED_APPDATA
    .write()
    .await
    .insert(key.to_string(), Arc::new(appdata));
  if let Some(old) = old {
    return Err(anyhow::anyhow!(
      "AppData already registered: id={}, type={}, new_type={}",
      key,
      std::any::type_name_of_val(old.as_ref()),
      std::any::type_name::<T>(),
    ));
  }
  println!(
    "AppData registered: id={}, type={}",
    key,
    std::any::type_name::<T>()
  );
  Ok(())
}

async fn get(id: &str) -> Option<Arc<dyn AppDataDyn + Send + Sync>> {
  REGISTERED_APPDATA.read().await.get(id).cloned()
}

async fn get_ok(id: &str) -> Result<Arc<dyn AppDataDyn + Send + Sync>, String> {
  get(id).await.ok_or(format!("AppData not found: {}", id))
}

#[tauri::command]
pub async fn appdata_cmd_schema_ids() -> Result<Vec<String>, String> {
  let mut keys = REGISTERED_APPDATA
    .read()
    .await
    .keys()
    .cloned()
    .collect::<Vec<String>>();
  keys.sort();
  Ok(keys)
}

#[tauri::command]
pub async fn appdata_cmd_schemas() -> Result<Vec<schemars::Schema>, String> {
  let mut schemas = Vec::new();
  for key in appdata_cmd_schema_ids().await? {
    schemas.push(get_ok(&key).await?.get_schema());
  }
  Ok(schemas)
}

#[tauri::command]
pub async fn appdata_cmd_get_schema(schema_id: &str) -> Result<schemars::Schema, String> {
  get_ok(schema_id)
    .await
    .and_then(|appdata| Ok(appdata.get_schema()))
}

#[tauri::command]
pub async fn appdata_cmd_get_data(schema_id: &str, key: u32) -> Result<Option<Vec<u8>>, String> {
  get_ok(schema_id)
    .await
    .and_then(|appdata| appdata.get_data(key))
}

#[tauri::command]
pub async fn appdata_cmd_save_data(schema_id: &str, data: Vec<u8>) -> Result<(), String> {
  get_ok(schema_id)
    .await
    .and_then(|appdata| appdata.save_data(&data))
}

#[tauri::command]
pub async fn appdata_cmd_remove_data(schema_id: &str, key: u32) -> Result<(), String> {
  get_ok(schema_id)
    .await
    .and_then(|appdata| appdata.remove_data(key))
}

#[tauri::command]
pub async fn appdata_cmd_exists_data(schema_id: &str, key: u32) -> Result<bool, String> {
  get_ok(schema_id)
    .await
    .and_then(|appdata| appdata.exists_data(key))
}

#[tauri::command]
pub async fn appdata_cmd_find_next_available_key(
  schema_id: &str,
  start_key: u32,
) -> Result<u32, String> {
  get_ok(schema_id)
    .await
    .and_then(|appdata| appdata.find_next_available_key(start_key))
}

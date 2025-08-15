use crate::appdata::AppData;
use reindeer::Entity;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, OnceLock};
use tokio::sync::RwLock;

/// Application configuration root structure
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
#[serde(rename_all = "camelCase")]
#[schemars(title = "Application Configuration")]
pub struct AppConfig {
  /// Logging system configuration
  pub logging: LoggingConfig,

  /// Feature flags and limitations
  pub features: FeaturesConfig,
}

/// Logging system configuration
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
#[schemars(title = "Logging Configuration")]
pub struct LoggingConfig {
  /// Verbosity level for logging
  #[schemars(
        title = "Log Level",
        example = LogLevel::Info,
        description = "Logging verbosity level"
    )]
  pub level: LogLevel,

  /// Enable or disable file logging
  #[schemars(
    title = "File Logging Enabled",
    example = true,
    description = "Whether to write logs to a file"
  )]
  pub file_logging: bool,
}

#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
pub enum LogLevel {
  Trace,
  Debug,
  Info,
  Warn,
  Error,
}

/// Feature flags and operational limits
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
#[schemars(title = "Feature Configuration")]
pub struct FeaturesConfig {
  /// Enable dark mode UI
  #[schemars(
    title = "Dark Mode Enabled",
    example = false,
    description = "Whether to use dark mode for the user interface"
  )]
  pub dark_mode: bool,

  /// Maximum number of concurrent operations
  #[schemars(
    title = "Max Concurrent Operations",
    range(min = 1, max = 32),
    example = 8,
    description = "Maximum number of simultaneous operations (1-32)"
  )]
  pub max_concurrent: u8,
}

/// Default configuration values
impl Default for AppConfig {
  fn default() -> Self {
    Self {
      logging: LoggingConfig {
        level: LogLevel::Info,
        file_logging: true,
      },
      features: FeaturesConfig {
        dark_mode: false,
        max_concurrent: 8,
      },
    }
  }
}

impl Entity for AppConfig {
  type Key = u32;

  fn store_name() -> &'static str {
    "app_config"
  }

  fn get_key(&self) -> &Self::Key {
    &0
  }

  fn set_key(&mut self, _key: &Self::Key) {}
}

static CONFIG: OnceLock<RwLock<Arc<AppConfig>>> = OnceLock::new();

pub async fn init_config() -> Result<(), String> {
  let config = AppConfig::get_data(&0)?;
  let config = if let Some(config) = config {
    config
  } else {
    let config = AppConfig::default();
    config
      .save_data()
      .map_err(|e| format!("Failed to create config: {:?}", e))?;
    config
  };
  CONFIG
    .set(RwLock::new(Arc::new(config)))
    .map_err(|e| format!("Already initialized: {:?}", e))
}

pub async fn get_config() -> Arc<AppConfig> {
  CONFIG.get().unwrap().read().await.clone()
}

pub async fn load_config() -> Result<Arc<AppConfig>, String> {
  let config = Arc::new(AppConfig::get_data(&0)?.ok_or("Config not found")?);
  set_config(config.clone()).await;
  Ok(config)
}

pub async fn save_config(config: AppConfig) -> Result<(), String> {
  config.save_data()?;
  set_config(Arc::new(config)).await;
  Ok(())
}

async fn set_config(config: Arc<AppConfig>) {
  *CONFIG.get().unwrap().write().await = config;
}

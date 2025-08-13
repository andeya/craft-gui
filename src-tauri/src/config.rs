use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::{
  path::PathBuf,
  sync::{Arc, OnceLock},
};
use tokio::sync::RwLock;

/// Application configuration root structure
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
#[serde(rename_all = "camelCase")]
#[schemars(title = "Application Configuration")]
pub struct AppConfig {
  /// Logging system configuration
  logging: LoggingConfig,

  /// Feature flags and limitations
  features: FeaturesConfig,
}

/// Logging system configuration
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
#[schemars(title = "Logging Configuration")]
struct LoggingConfig {
  /// Verbosity level for logging
  #[schemars(
        title = "Log Level",
        example = LogLevel::Info,
        description = "Logging verbosity level"
    )]
  level: LogLevel,

  /// Enable or disable file logging
  #[schemars(
    title = "File Logging Enabled",
    example = true,
    description = "Whether to write logs to a file"
  )]
  file_logging: bool,
}

#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
enum LogLevel {
  Trace,
  Debug,
  Info,
  Warn,
  Error,
}

/// Feature flags and operational limits
#[derive(Debug, Serialize, Deserialize, JsonSchema, Clone)]
#[schemars(title = "Feature Configuration")]
struct FeaturesConfig {
  /// Enable dark mode UI
  #[schemars(
    title = "Dark Mode Enabled",
    example = false,
    description = "Whether to use dark mode for the user interface"
  )]
  dark_mode: bool,

  /// Maximum number of concurrent operations
  #[schemars(
    title = "Max Concurrent Operations",
    range(min = 1, max = 32),
    example = 8,
    description = "Maximum number of simultaneous operations (1-32)"
  )]
  max_concurrent: u8,
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

/// Tauri command to get the JSON schema for configuration validation
#[tauri::command]
pub fn cfg_cmd_get_schema() -> schemars::Schema {
  schemars::schema_for!(AppConfig)
}

/// Tauri command to get the current configuration values
#[tauri::command]
pub async fn cfg_cmd_get_data() -> Result<Arc<AppConfig>, String> {
  let config = load_config().await?;
  set_config(config.clone()).await;
  Ok(config)
}

/// Tauri command to save configuration with validation
#[tauri::command()]
pub async fn cfg_cmd_save_data(config: Arc<AppConfig>) -> Result<(), String> {
  save_config(&config).await?;
  set_config(config).await;
  Ok(())
}

static CONFIG_PATH: OnceLock<PathBuf> = OnceLock::new();

pub async fn setup(dir: PathBuf) -> anyhow::Result<()> {
  let _ = CONFIG_PATH
    .set(dir.clone().join("config.toml"))
    .map_err(|e| anyhow::anyhow!("Failed to set config file path: {}", e.to_string_lossy()));
  let config_path = CONFIG_PATH.get().unwrap();

  let config: Arc<AppConfig> = if !config_path.exists() {
    let config = Arc::new(AppConfig::default());
    save_config(&config).await.map_err(|e| anyhow::anyhow!(e))?;
    config
  } else {
    load_config().await.map_err(|e| anyhow::anyhow!(e))?
  };
  CONFIG
    .set(RwLock::new(config))
    .map_err(|_| anyhow::anyhow!("Failed to set config"))
}

static CONFIG: OnceLock<RwLock<Arc<AppConfig>>> = OnceLock::new();

pub async fn get_config() -> Arc<AppConfig> {
  CONFIG.get().unwrap().read().await.clone()
}

async fn set_config(config: Arc<AppConfig>) {
  *CONFIG.get().unwrap().write().await = config;
}

async fn load_config() -> Result<Arc<AppConfig>, String> {
  let config_path = CONFIG_PATH.get().unwrap();
  let config =
    std::fs::read(config_path).map_err(|e| format!("Failed to read config file: {}", e))?;
  let config: AppConfig =
    toml::from_slice(&config).map_err(|e| format!("Failed to parse config file: {}", e))?;
  Ok(Arc::new(config))
}

async fn save_config(config: &AppConfig) -> Result<(), String> {
  let config_path = CONFIG_PATH.get().unwrap();
  let config_str =
    toml::to_string_pretty(config).map_err(|e| format!("Failed to serialize config: {}", e))?;
  std::fs::write(config_path, config_str)
    .map_err(|e| format!("Failed to write config file: {}", e))?;
  Ok(())
}

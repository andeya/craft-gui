use std::io::Write;
use std::{path::PathBuf, sync::OnceLock};

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

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
pub fn get_config_schema() -> schemars::Schema {
  schemars::schema_for!(AppConfig)
}

/// Tauri command to get the current configuration values
#[tauri::command]
pub fn get_current_config() -> Result<AppConfig, String> {
  let config_path = CONFIG_FILE.get().unwrap();
  let config =
    std::fs::read(config_path).map_err(|e| format!("Failed to read config file: {}", e))?;
  let config: AppConfig =
    toml::from_slice(&config).map_err(|e| format!("Failed to parse config file: {}", e))?;
  Ok(config)
}

/// Tauri command to save configuration with validation
#[tauri::command()]
pub fn save_config(config: AppConfig) -> Result<(), String> {
  let config_path = CONFIG_FILE.get().unwrap();
  let config =
    toml::to_string_pretty(&config).map_err(|e| format!("Failed to serialize config: {}", e))?;
  std::fs::write(config_path, config).map_err(|e| format!("Failed to write config file: {}", e))?;
  Ok(())
}

static CONFIG_FILE: OnceLock<PathBuf> = OnceLock::new();

pub fn setup(dir: PathBuf) -> anyhow::Result<()> {
  let _ = CONFIG_FILE
    .set(dir.clone().join("config.toml"))
    .map_err(|e| anyhow::anyhow!("Failed to set config file path: {}", e.to_string_lossy()));
  let config_path = CONFIG_FILE.get().unwrap();
  if !config_path.exists() {
    std::fs::create_dir_all(&dir)
      .map_err(|e| anyhow::anyhow!("Failed to create config directory {}: {}", dir.display(), e))?;
    let mut file = std::fs::File::create(config_path).map_err(|e| {
      anyhow::anyhow!(
        "Failed to create config file {}: {}",
        config_path.display(),
        e
      )
    })?;
    let config = AppConfig::default();
    let config = toml::to_string_pretty(&config).map_err(|e| {
      anyhow::anyhow!(
        "Failed to serialize config {}: {}",
        config_path.display(),
        e
      )
    })?;
    file.write_all(config.as_bytes()).map_err(|e| {
      anyhow::anyhow!(
        "Failed to write config file {}: {}",
        config_path.display(),
        e
      )
    })?;
  }
  Ok(())
}

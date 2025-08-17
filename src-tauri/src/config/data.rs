use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

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
        example = LogLevel::Debug,
        description = "Logging verbosity level"
    )]
  pub level: LogLevel,

  /// Enable or disable file logging
  #[schemars(
    title = "File Logging Enabled",
    example = false,
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
  Off,
}

impl Default for LogLevel {
  fn default() -> Self {
    if cfg!(debug_assertions) {
      Self::Trace
    } else {
      Self::Info
    }
  }
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
        level: LogLevel::default(),
        file_logging: false,
      },
      features: FeaturesConfig {
        dark_mode: false,
        max_concurrent: 8,
      },
    }
  }
}

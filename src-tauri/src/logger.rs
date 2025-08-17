use crate::config;
use fern::Dispatch;
use std::path::PathBuf;

pub fn init(app_data_dir: PathBuf) -> Result<(), fern::InitError> {
  let log_dir = app_data_dir.join("logs");
  std::fs::create_dir_all(&log_dir)?;

  Dispatch::new()
    .format(|out, message, record| {
      out.finish(format_args!(
        "[{} {} {}] {}",
        chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
        record.level(),
        record.target(),
        message
      ))
    })
    // Global log level: dynamic
    .filter(|record| record.level() <= config::get_config().logging.level.to_log_level_filter())
    // Console output (available in development environment)
    .chain(std::io::stdout())
    .chain(
      Dispatch::new()
        .filter(|_record| config::get_config().logging.file_logging)
        // All logs written to main file
        .chain(fern::log_file(log_dir.join("app.log"))?)
        // Error logs written separately to error.log
        .chain(
          Dispatch::new()
            .level(log::LevelFilter::Error)
            .chain(fern::log_file(log_dir.join("error.log"))?),
        ),
    )
    .apply()?;
  Ok(())
}

impl config::LogLevel {
  pub fn to_log_level_filter(&self) -> log::LevelFilter {
    match self {
      config::LogLevel::Trace => log::LevelFilter::Trace,
      config::LogLevel::Debug => log::LevelFilter::Debug,
      config::LogLevel::Info => log::LevelFilter::Info,
      config::LogLevel::Warn => log::LevelFilter::Warn,
      config::LogLevel::Error => log::LevelFilter::Error,
      config::LogLevel::Off => log::LevelFilter::Off,
    }
  }
}

use std::path::PathBuf;

mod sled;

pub async fn init(app_data_dir: PathBuf) -> anyhow::Result<()> {
  sled::init(app_data_dir)?;
  Ok(())
}

pub use sled::db as sled_db;

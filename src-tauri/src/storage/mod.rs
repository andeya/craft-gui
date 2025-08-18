use std::path::PathBuf;

mod appdata;
mod rawentity;
mod sled;

pub async fn init(app_data_dir: PathBuf) -> anyhow::Result<()> {
  sled::init(app_data_dir)?;
  Ok(())
}

pub use appdata::*;
pub use rawentity::*;
use sled::{db, flush_db};

use std::path::PathBuf;

#[cfg(feature = "sqlite")]
mod sqlite;

mod sled;

pub async fn init(app_data_dir: PathBuf) -> anyhow::Result<()> {
  sled::init(app_data_dir)?;
  #[cfg(feature = "sqlite")]
  sqlite::init(app_data_dir).await?;
  Ok(())
}

pub use sled::db as sled_db;

#[cfg(feature = "sqlite")]
#[allow(unused_imports)]
pub use sqlite::db as sqlite_db;

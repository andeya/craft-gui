use std::path::PathBuf;
use std::sync::OnceLock;

use reindeer::Db;

static DB: OnceLock<Db> = OnceLock::new();

pub fn init(app_dir: PathBuf) -> anyhow::Result<()> {
  let db = reindeer::open(app_dir.join("sled.db"))
    .map_err(|e| anyhow::anyhow!("Failed to open sled database: {}", e))?;
  DB.set(db)
    .map_err(|_| anyhow::anyhow!("Sled has already been initialized"))?;
  Ok(())
}

#[allow(dead_code)]
pub fn db() -> &'static Db {
  DB.get().expect("Sled database not initialized")
}

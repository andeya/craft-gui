use std::path::PathBuf;
use std::sync::OnceLock;

use reindeer::Db;

static DB: OnceLock<Db> = OnceLock::new();

pub fn init(app_dir: PathBuf) -> anyhow::Result<()> {
  let db = reindeer::Config::new()
    .flush_every_ms(None)
    .cache_capacity(1024 << 20)
    .path(app_dir.join("sled.db"))
    .open()
    .map_err(|e| anyhow::anyhow!("Failed to open sled database: {}", e))?;
  DB.set(db)
    .map_err(|_| anyhow::anyhow!("Sled has already been initialized"))?;
  Ok(())
}

pub(super) fn db() -> &'static Db {
  DB.get().expect("Sled database not initialized")
}

pub(super) fn flush_db() -> Result<(), String> {
  let _ = db().flush().map_err(|e| e.to_string())?;
  Ok(())
}

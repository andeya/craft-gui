use sea_orm::{prelude::*, Database};
use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;

static DB: OnceLock<DatabaseConnection> = OnceLock::new();

pub async fn init(app_dir: PathBuf) -> anyhow::Result<()> {
  if !app_dir.exists() {
    fs::create_dir_all(&app_dir)?;
  }
  let fp = app_dir.join("sqlite.db");
  let conn_str = format!("sqlite://{}?mode=rwc", fp.display());
  let conn = Database::connect(conn_str).await?;
  DB.set(conn)
    .map_err(|_| anyhow::anyhow!("Sqlite has already been initialized"))?;
  Ok(())
}

pub fn db() -> &'static DatabaseConnection {
  DB.get().expect("Sqlite database not initialized")
}

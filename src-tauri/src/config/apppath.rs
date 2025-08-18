use std::{
  path::PathBuf,
  sync::{Arc, OnceLock},
};

use serde::{Deserialize, Serialize};

static PATH_RESOLVER: OnceLock<Arc<PathResolver>> = OnceLock::new();

pub(super) fn init_path_resolver<R: tauri::Runtime>(path_resolver: &tauri::path::PathResolver<R>) {
  let _ = PATH_RESOLVER.set(Arc::new(PathResolver {
    audio_dir: string_result(path_resolver.audio_dir()),
    cache_dir: string_result(path_resolver.cache_dir()),
    config_dir: string_result(path_resolver.config_dir()),
    data_dir: string_result(path_resolver.data_dir()),
    local_data_dir: string_result(path_resolver.local_data_dir()),
    desktop_dir: string_result(path_resolver.desktop_dir()),
    document_dir: string_result(path_resolver.document_dir()),
    download_dir: string_result(path_resolver.download_dir()),
    executable_dir: string_result(path_resolver.executable_dir()),
    font_dir: string_result(path_resolver.font_dir()),
    home_dir: string_result(path_resolver.home_dir()),
    picture_dir: string_result(path_resolver.picture_dir()),
    public_dir: string_result(path_resolver.public_dir()),
    runtime_dir: string_result(path_resolver.runtime_dir()),
    template_dir: string_result(path_resolver.template_dir()),
    video_dir: string_result(path_resolver.video_dir()),
    resource_dir: string_result(path_resolver.resource_dir()),
    app_config_dir: string_result(path_resolver.app_config_dir()),
    app_data_dir: string_result(path_resolver.app_data_dir()),
    app_local_data_dir: string_result(path_resolver.app_local_data_dir()),
    app_cache_dir: string_result(path_resolver.app_cache_dir()),
    app_log_dir: string_result(path_resolver.app_log_dir()),
    temp_dir: string_result(path_resolver.temp_dir()),
  }));
}

pub fn path_resolver() -> &'static PathResolver {
  PATH_RESOLVER.get().unwrap()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathResolver {
  pub audio_dir: Result<String, String>,
  pub cache_dir: Result<String, String>,
  pub config_dir: Result<String, String>,
  pub data_dir: Result<String, String>,
  pub local_data_dir: Result<String, String>,
  pub desktop_dir: Result<String, String>,
  pub document_dir: Result<String, String>,
  pub download_dir: Result<String, String>,
  pub executable_dir: Result<String, String>,
  pub font_dir: Result<String, String>,
  pub home_dir: Result<String, String>,
  pub picture_dir: Result<String, String>,
  pub public_dir: Result<String, String>,
  pub runtime_dir: Result<String, String>,
  pub template_dir: Result<String, String>,
  pub video_dir: Result<String, String>,
  pub resource_dir: Result<String, String>,
  pub app_config_dir: Result<String, String>,
  pub app_data_dir: Result<String, String>,
  pub app_local_data_dir: Result<String, String>,
  pub app_cache_dir: Result<String, String>,
  pub app_log_dir: Result<String, String>,
  pub temp_dir: Result<String, String>,
}

fn string_result(result: tauri::Result<PathBuf>) -> Result<String, String> {
  match result {
    Ok(path) => Ok(path.to_string_lossy().to_string()),
    Err(e) => Err(e.to_string()),
  }
}

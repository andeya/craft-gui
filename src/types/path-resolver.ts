/**
 * PathResolver type definitions
 * Corresponds to the Rust PathResolver struct
 */

export interface PathResolver {
  audio_dir: Result<string, string>;
  cache_dir: Result<string, string>;
  config_dir: Result<string, string>;
  data_dir: Result<string, string>;
  local_data_dir: Result<string, string>;
  desktop_dir: Result<string, string>;
  document_dir: Result<string, string>;
  download_dir: Result<string, string>;
  executable_dir: Result<string, string>;
  font_dir: Result<string, string>;
  home_dir: Result<string, string>;
  picture_dir: Result<string, string>;
  public_dir: Result<string, string>;
  runtime_dir: Result<string, string>;
  template_dir: Result<string, string>;
  video_dir: Result<string, string>;
  resource_dir: Result<string, string>;
  app_config_dir: Result<string, string>;
  app_data_dir: Result<string, string>;
  app_local_data_dir: Result<string, string>;
  app_cache_dir: Result<string, string>;
  app_log_dir: Result<string, string>;
  temp_dir: Result<string, string>;
}

// Helper type for Result<T, E> - matches Rust's serialized Result
export interface Result<T, E> {
  Ok?: T;
  Err?: E;
}

// Path category for grouping paths
export interface PathCategory {
  name: string;
  description: string;
  icon: string;
  color: string;
  paths: Array<{
    key: keyof PathResolver;
    label: string;
    description: string;
    value: Result<string, string>;
  }>;
}

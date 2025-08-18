/**
 * Tauri command constants
 * Centralized management of all Tauri command names
 */

export const TAURI_COMMANDS = {
  // AppData commands (used by both appdata and config modes)
  APPDATA: {
    GET_SCHEMA: "appdata_cmd_get_schema",
    GET_DATA: "appdata_cmd_get_data",
    SAVE_DATA: "appdata_cmd_save_data",
    REMOVE_DATA: "appdata_cmd_remove_data",
    EXISTS_DATA: "appdata_cmd_exists_data",
    FIND_NEXT_AVAILABLE_KEY: "appdata_cmd_find_next_available_key",
  },
  // Config commands
  CONFIG: {
    PATH_RESOLVER: "config_cmd_path_resolver",
  },
  // General commands
  GENERAL: {
    GREET: "greet",
  },
} as const;

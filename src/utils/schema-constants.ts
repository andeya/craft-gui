/**
 * Schema constants
 * Centralized management of schema names and configurations
 */

export const SCHEMA_NAMES = {
  USER_PROFILE: "UserProfile",
  PRODUCT_CONFIG: "ProductConfig",
  SYSTEM_SETTINGS: "SystemSettings",
  APP_CONFIG: "AppConfig",
} as const;

export const SCHEMA_TITLES = {
  [SCHEMA_NAMES.USER_PROFILE]: "User Profile",
  [SCHEMA_NAMES.PRODUCT_CONFIG]: "Product Configuration",
  [SCHEMA_NAMES.SYSTEM_SETTINGS]: "System Settings",
  [SCHEMA_NAMES.APP_CONFIG]: "Application Configuration",
} as const;

/**
 * Default available schemas for demo purposes
 */
export const DEFAULT_AVAILABLE_SCHEMAS = [
  { name: SCHEMA_NAMES.USER_PROFILE, title: SCHEMA_TITLES[SCHEMA_NAMES.USER_PROFILE] },
  { name: SCHEMA_NAMES.PRODUCT_CONFIG, title: SCHEMA_TITLES[SCHEMA_NAMES.PRODUCT_CONFIG] },
  { name: SCHEMA_NAMES.SYSTEM_SETTINGS, title: SCHEMA_TITLES[SCHEMA_NAMES.SYSTEM_SETTINGS] },
] as const;

/**
 * Get schema title by name
 */
export function getSchemaTitle(schemaName: string): string {
  return SCHEMA_TITLES[schemaName as keyof typeof SCHEMA_TITLES] || schemaName;
}

/**
 * Check if schema name is valid
 */
export function isValidSchemaName(schemaName: string): boolean {
  return Object.values(SCHEMA_NAMES).includes(schemaName as any);
}

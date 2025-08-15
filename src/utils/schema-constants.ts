/**
 * Schema constants
 * Centralized management of schema ids and configurations
 */

export const SCHEMA_IDS = {
  USER_PROFILE: "UserProfile",
  PRODUCT_CONFIG: "ProductConfig",
  SYSTEM_SETTINGS: "SystemSettings",
  APP_CONFIG: "AppConfig",
} as const;

export const SCHEMA_TITLES = {
  [SCHEMA_IDS.USER_PROFILE]: "User Profile",
  [SCHEMA_IDS.PRODUCT_CONFIG]: "Product Configuration",
  [SCHEMA_IDS.SYSTEM_SETTINGS]: "System Settings",
  [SCHEMA_IDS.APP_CONFIG]: "Application Configuration",
} as const;

/**
 * Default available schemas for demo purposes
 */
export const DEFAULT_AVAILABLE_SCHEMAS = [
  {
    name: SCHEMA_IDS.USER_PROFILE,
    title: SCHEMA_TITLES[SCHEMA_IDS.USER_PROFILE],
  },
  {
    name: SCHEMA_IDS.PRODUCT_CONFIG,
    title: SCHEMA_TITLES[SCHEMA_IDS.PRODUCT_CONFIG],
  },
  {
    name: SCHEMA_IDS.SYSTEM_SETTINGS,
    title: SCHEMA_TITLES[SCHEMA_IDS.SYSTEM_SETTINGS],
  },
] as const;

/**
 * Get schema title by name
 */
export function getSchemaTitle(schemaId: string): string {
  return SCHEMA_TITLES[schemaId as keyof typeof SCHEMA_TITLES] || schemaId;
}

/**
 * Check if schema id is valid
 */
export function isValidSchemaId(schemaId: string): boolean {
  return Object.values(SCHEMA_IDS).includes(schemaId as any);
}

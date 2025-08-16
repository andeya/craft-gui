import type { FieldLayoutConfig } from "./types";

/**
 * Get layout configuration for a specific field
 * @param fieldKey - The field key to look for
 * @param fieldLayoutConfig - Array of field layout configurations
 * @returns The layout configuration for the field, or undefined if not found
 */
export const getFieldLayout = (
  fieldKey: string,
  fieldLayoutConfig: FieldLayoutConfig[]
): FieldLayoutConfig | undefined => {
  return fieldLayoutConfig.find((config) => config.fieldKey === fieldKey);
};

/**
 * Get root level layout configuration
 * @param fieldLayoutConfig - Array of field layout configurations
 * @returns The root layout configuration, or undefined if not found
 */
export const getRootLayout = (
  fieldLayoutConfig: FieldLayoutConfig[]
): FieldLayoutConfig | undefined => {
  return fieldLayoutConfig.find((config) => config.fieldKey === undefined);
};

/**
 * Calculate columns for a field based on layout config
 * @param fieldKey - The field key
 * @param fieldLayoutConfig - Array of field layout configurations
 * @param defaultColumns - Default number of columns if no config found
 * @returns Number of columns for the field
 */
export const getFieldColumns = (
  fieldKey: string,
  fieldLayoutConfig: FieldLayoutConfig[],
  defaultColumns: number
): number => {
  const layout = getFieldLayout(fieldKey, fieldLayoutConfig);
  return layout?.columns ?? defaultColumns;
};

/**
 * Calculate grid span for a field
 * @param fieldKey - The field key
 * @param fieldLayoutConfig - Array of field layout configurations
 * @returns Number of columns this field spans in the grid
 */
export const getFieldSpan = (
  fieldKey: string,
  fieldLayoutConfig: FieldLayoutConfig[]
): number => {
  const layout = getFieldLayout(fieldKey, fieldLayoutConfig);
  return layout?.span ?? 1;
};

/**
 * Get root columns for the main container
 * @param fieldLayoutConfig - Array of field layout configurations
 * @param defaultColumns - Default number of columns if no config found
 * @returns Number of columns for the root container
 */
export const getRootColumns = (
  fieldLayoutConfig: FieldLayoutConfig[],
  defaultColumns: number
): number => {
  const rootLayout = getRootLayout(fieldLayoutConfig);
  return rootLayout?.columns ?? defaultColumns;
};

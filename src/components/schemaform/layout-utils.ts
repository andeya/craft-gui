import type { FieldLayoutConfig } from "./types";
import { fieldPathResolver, type ResolvedFieldInfo } from "./ref-path-resolver";

/**
 * Get layout configuration for a specific field
 * @param fieldPath - The field path to look for (e.g., "user.name", "profile.email")
 * @param fieldLayoutConfig - Array of field layout configurations
 * @returns The layout configuration for the field, or undefined if not found
 */
export const getFieldLayout = (
  fieldPath: string,
  fieldLayoutConfig: FieldLayoutConfig[]
): FieldLayoutConfig | undefined => {
  return fieldLayoutConfig.find((config) => config.fieldPath === fieldPath);
};

/**
 * Get layout configuration for a field with $ref support
 * @param fieldInfo - Resolved field information
 * @param fieldLayoutConfig - Array of field layout configurations
 * @returns The layout configuration for the field, or undefined if not found
 */
export const getFieldLayoutWithRef = (
  fieldInfo: ResolvedFieldInfo,
  fieldLayoutConfig: FieldLayoutConfig[]
): FieldLayoutConfig | undefined => {
  return fieldPathResolver.findLayoutConfig(fieldInfo, fieldLayoutConfig);
};

/**
 * Get root level layout configuration
 * @param fieldLayoutConfig - Array of field layout configurations
 * @returns The root layout configuration, or undefined if not found
 */
export const getRootLayout = (
  fieldLayoutConfig: FieldLayoutConfig[]
): FieldLayoutConfig | undefined => {
  return fieldLayoutConfig.find((config) => config.fieldPath === undefined);
};

/**
 * Calculate columns for a field based on layout config
 * @param fieldPath - The field path
 * @param fieldLayoutConfig - Array of field layout configurations
 * @param defaultColumns - Default number of columns if no config found
 * @returns Number of columns for the field
 */
export const getFieldColumns = (
  fieldPath: string,
  fieldLayoutConfig: FieldLayoutConfig[],
  defaultColumns: number
): number => {
  const layout = getFieldLayout(fieldPath, fieldLayoutConfig);
  return layout?.columns ?? defaultColumns;
};

/**
 * Calculate grid span for a field
 * @param fieldPath - The field path
 * @param fieldLayoutConfig - Array of field layout configurations
 * @returns Number of columns this field spans in the grid
 */
export const getFieldSpan = (
  fieldPath: string,
  fieldLayoutConfig: FieldLayoutConfig[]
): number => {
  const layout = getFieldLayout(fieldPath, fieldLayoutConfig);
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

/**
 * Validate field layout configuration
 * @param fieldLayoutConfig - Array of field layout configurations
 * @param rootColumns - Number of columns in the root container
 * @returns Validation result with errors if any
 */
export const validateFieldLayout = (
  fieldLayoutConfig: FieldLayoutConfig[],
  rootColumns: number
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check if total spans exceed root columns
  const totalSpans = fieldLayoutConfig
    .filter((config) => config.fieldPath !== undefined) // Only check non-root configs
    .reduce((sum, config) => sum + (config.span ?? 1), 0);

  if (totalSpans > rootColumns) {
    errors.push(
      `Total field spans (${totalSpans}) exceed root columns (${rootColumns}). ` +
        `This will cause layout overflow.`
    );
  }

  // Check for invalid span values
  fieldLayoutConfig.forEach((config) => {
    if (config.span && (config.span < 1 || config.span > rootColumns)) {
      const fieldName = getFieldName(config.fieldPath);
      errors.push(
        `Field "${fieldName}" span (${config.span}) is invalid. ` +
          `Must be between 1 and ${rootColumns}.`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Build field path from parent path and current field key
 * @param parentPath - Parent field path (e.g., "user")
 * @param fieldKey - Current field key (e.g., "name")
 * @returns Full field path (e.g., "user.name")
 */
export const buildFieldPath = (
  parentPath: string,
  fieldKey: string
): string => {
  if (!parentPath) return fieldKey;
  return `${parentPath}.${fieldKey}`;
};

/**
 * Extract field name from field path
 * @param fieldPath - Full field path (e.g., "user.name", "profile.email")
 * @returns Field name (last part of the path)
 */
export const getFieldName = (fieldPath?: string): string => {
  if (fieldPath) {
    const parts = fieldPath.split(".");
    return parts[parts.length - 1] || fieldPath;
  }
  return "Field";
};

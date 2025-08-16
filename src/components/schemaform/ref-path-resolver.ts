import type { AppSchema } from "../../types/schema";

/**
 * Resolved field information with context
 */
export interface ResolvedFieldInfo {
  fieldPath: string; // Full field path (e.g., "user.name")
  refPath?: string; // Reference path if this field comes from a $ref
  parentPath: string; // Parent path (e.g., "user")
  fieldName: string; // Field name (e.g., "name")
  schema: AppSchema; // Resolved schema
  isRefField: boolean; // Whether this field comes from a $ref
}

/**
 * Field path resolver for handling $ref objects
 */
export class FieldPathResolver {
  private refCache = new Map<string, AppSchema>();

  /**
   * Resolve field path with $ref context
   * @param fieldKey - Current field key
   * @param parentKey - Parent field key
   * @param schema - Current schema
   * @param rootSchema - Root schema for $ref resolution
   * @returns Resolved field information
   */
  resolveFieldPath(
    fieldKey: string,
    parentKey: string,
    schema: AppSchema,
    rootSchema: AppSchema
  ): ResolvedFieldInfo {
    const parentPath = parentKey || "";
    const fieldPath = parentPath ? `${parentPath}.${fieldKey}` : fieldKey;

    // Check if this field comes from a $ref
    const refInfo = this.resolveRefInfo(schema, rootSchema);

    return {
      fieldPath,
      refPath: refInfo?.refPath,
      parentPath,
      fieldName: fieldKey,
      schema: refInfo?.resolvedSchema || schema,
      isRefField: !!refInfo,
    };
  }

  /**
   * Resolve $ref information
   * @param schema - Schema to check for $ref
   * @param rootSchema - Root schema for resolution
   * @returns Ref information if found
   */
  private resolveRefInfo(
    schema: AppSchema,
    rootSchema: AppSchema
  ): { refPath: string; resolvedSchema: AppSchema } | null {
    if (!schema.$ref) return null;

    const refPath = schema.$ref;
    const cacheKey = `${rootSchema.$id || "default"}:${refPath}`;

    if (this.refCache.has(cacheKey)) {
      return {
        refPath,
        resolvedSchema: this.refCache.get(cacheKey)!,
      };
    }

    // Resolve $ref
    const resolvedSchema = this.resolveRef(schema.$ref, rootSchema);
    if (resolvedSchema) {
      this.refCache.set(cacheKey, resolvedSchema);
      return { refPath, resolvedSchema };
    }

    return null;
  }

  /**
   * Resolve $ref to actual schema
   * @param ref - Reference string (e.g., "#/$defs/Person")
   * @param rootSchema - Root schema
   * @returns Resolved schema or null
   */
  private resolveRef(ref: string, rootSchema: AppSchema): AppSchema | null {
    if (!ref.startsWith("#/")) return null;

    const path = ref.substring(2).split("/");
    let current: any = rootSchema;

    for (const segment of path) {
      if (current && typeof current === "object" && segment in current) {
        current = current[segment];
      } else {
        return null;
      }
    }

    return current as AppSchema;
  }

  /**
   * Get layout configuration key for a field
   * This handles the case where multiple fields reference the same $ref
   * @param fieldInfo - Resolved field information
   * @param layoutConfig - Layout configuration array
   * @returns Layout configuration key
   */
  getLayoutConfigKey(fieldInfo: ResolvedFieldInfo): string {
    // If it's a ref field, use the ref path as part of the key
    if (fieldInfo.isRefField && fieldInfo.refPath) {
      return `${fieldInfo.parentPath}${fieldInfo.refPath}`;
    }

    // Otherwise use the full field path
    return fieldInfo.fieldPath;
  }

  /**
   * Find layout configuration for a field
   * @param fieldInfo - Resolved field information
   * @param layoutConfig - Layout configuration array
   * @returns Layout configuration or undefined
   */
  findLayoutConfig(
    fieldInfo: ResolvedFieldInfo,
    layoutConfig: Array<{ fieldPath?: string; columns: number; span?: number }>
  ): { fieldPath?: string; columns: number; span?: number } | undefined {
    const configKey = this.getLayoutConfigKey(fieldInfo);

    // Try exact match first
    let config = layoutConfig.find((c) => c.fieldPath === fieldInfo.fieldPath);
    if (config) return config;

    // Try ref-based match for ref fields
    if (fieldInfo.isRefField && fieldInfo.refPath) {
      config = layoutConfig.find((c) => c.fieldPath === configKey);
      if (config) return config;
    }

    // Try parent path match
    config = layoutConfig.find((c) => c.fieldPath === fieldInfo.parentPath);
    if (config) return config;

    return undefined;
  }

  /**
   * Clear ref cache
   */
  clearCache(): void {
    this.refCache.clear();
  }
}

// Export singleton instance
export const fieldPathResolver = new FieldPathResolver();

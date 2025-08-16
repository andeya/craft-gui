import type { AppSchema } from "../types/schema";

/**
 * Schema traversal callback function type
 */
export type SchemaTraversalCallback = (
  schema: AppSchema,
  path: string[],
  parentSchema?: AppSchema,
  parentKey?: string
) => any;

/**
 * Schema traversal options
 */
export interface SchemaTraversalOptions {
  maxDepth?: number;
  resolveRefs?: boolean;
  includeArrays?: boolean;
  includeObjects?: boolean;
  includePrimitives?: boolean;
}

/**
 * Resolve $ref references in schema (recursive)
 */
export function resolveSchemaRef(
  schema: AppSchema,
  rootSchema: AppSchema,
  maxDepth: number = 10,
  visited: Set<string> = new Set()
): AppSchema {
  if (!schema.$ref || !rootSchema || maxDepth <= 0) {
    return schema;
  }

  const refPath = schema.$ref;

  // Debug logging in development
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.log(`[resolveSchemaRef] Resolving: ${refPath}`);
    console.log(
      `[resolveSchemaRef] Root schema keys:`,
      Object.keys(rootSchema)
    );
    console.log(
      `[resolveSchemaRef] $defs keys:`,
      Object.keys(rootSchema.$defs || {})
    );
  }

  // Note: Circular reference detection is now handled in traverseSchemaForFields
  // This function only resolves references without circular detection
  if (visited.has(refPath)) {
    // Skip already visited references to avoid infinite recursion
    return schema;
  }

  // Add to visited set to prevent infinite recursion
  visited.add(refPath);

  let resolved: AppSchema | undefined;

  // Handle #/$defs/ references
  if (refPath.startsWith("#/$defs/")) {
    const defName = refPath.substring(8);
    resolved = rootSchema.$defs?.[defName];
  }

  // Handle #/properties/ references
  if (refPath.startsWith("#/properties/")) {
    const propPath = refPath.substring(13);
    const props = propPath.split("/");
    let current = rootSchema;

    for (const prop of props) {
      if (current.properties && current.properties[prop]) {
        current = current.properties[prop];
      } else {
        resolved = undefined;
        break;
      }
    }

    if (current !== rootSchema) {
      resolved = current;
    }
  }

  if (resolved) {
    // Debug logging in development
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.log(`[resolveSchemaRef] Successfully resolved: ${refPath}`);
      console.log(`[resolveSchemaRef] Resolved schema:`, resolved);
    }

    // Merge the resolved schema with the original schema
    const mergedSchema = { ...resolved, ...schema };

    // Recursively resolve any nested $ref in the resolved schema
    return resolveSchemaRef(mergedSchema, rootSchema, maxDepth - 1, visited);
  }

  // Debug logging for unresolved references
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[resolveSchemaRef] Failed to resolve: ${refPath}`);
  }

  return schema;
}

/**
 * Get schema type (handles array types)
 */
export function getSchemaType(schema: AppSchema): string {
  const type = schema.type;
  if (Array.isArray(type)) {
    return type[0] || "string";
  }
  return type || "string";
}

/**
 * Check if schema is a primitive type
 */
export function isPrimitiveType(schema: AppSchema): boolean {
  const type = getSchemaType(schema);
  return ["string", "integer", "number", "boolean", "null"].includes(type);
}

/**
 * Check if schema is an object type
 */
export function isObjectType(schema: AppSchema): boolean {
  return getSchemaType(schema) === "object";
}

/**
 * Check if schema is an array type
 */
export function isArrayType(schema: AppSchema): boolean {
  return getSchemaType(schema) === "array";
}

/**
 * Generic schema traversal function
 * Supports recursion, $ref resolution, and custom callback processing
 */
export function traverseSchema(
  schema: AppSchema,
  callback: SchemaTraversalCallback,
  options: SchemaTraversalOptions = {},
  rootSchema?: AppSchema,
  path: string[] = [],
  parentSchema?: AppSchema,
  parentKey?: string,
  visited: Set<string> = new Set()
): any {
  const {
    maxDepth = 10,
    resolveRefs = true,
    includeArrays = true,
    includeObjects = true,
    includePrimitives = true,
  } = options;

  // Check depth limit
  if (maxDepth <= 0) {
    return callback(schema, path, parentSchema, parentKey);
  }

  // Create a unique identifier for this schema node to detect cycles
  const nodeId = path.length > 0 ? path.join(".") : "root";

  // Check for circular references
  if (visited.has(nodeId)) {
    console.warn(
      `Circular reference detected in schema traversal at path: ${nodeId}`
    );
    return callback(schema, path, parentSchema, parentKey);
  }

  // Add current node to visited set
  visited.add(nodeId);

  // Resolve $ref references if enabled
  const resolvedSchema =
    resolveRefs && rootSchema ? resolveSchemaRef(schema, rootSchema) : schema;

  const type = getSchemaType(resolvedSchema);

  // Handle different schema types
  switch (type) {
    case "object":
      if (!includeObjects) {
        return callback(resolvedSchema, path, parentSchema, parentKey);
      }

      // For data initialization, check if the object itself has examples or default
      // But for schema traversal (like field generation), we should continue
      // We'll use a different approach - only apply this logic in initializeSchemaData

      if (resolvedSchema.properties) {
        const result: Record<string, any> = {};

        Object.entries(resolvedSchema.properties).forEach(
          ([key, propSchema]) => {
            const newPath = [...path, key];
            result[key] = traverseSchema(
              propSchema,
              callback,
              { ...options, maxDepth: maxDepth - 1 },
              rootSchema,
              newPath,
              resolvedSchema,
              key,
              visited
            );
          }
        );

        return result;
      }

      return callback(resolvedSchema, path, parentSchema, parentKey);

    case "array":
      if (!includeArrays) {
        return callback(resolvedSchema, path, parentSchema, parentKey);
      }

      if (resolvedSchema.items && maxDepth > 0) {
        if (Array.isArray(resolvedSchema.items)) {
          // Tuple array - process each item
          return resolvedSchema.items.map((item, index) => {
            const newPath = [...path, index.toString()];
            return traverseSchema(
              item,
              callback,
              { ...options, maxDepth: maxDepth - 1 },
              rootSchema,
              newPath,
              resolvedSchema,
              index.toString(),
              visited
            );
          });
        } else {
          // Regular array - return empty array (items added dynamically)
          return [];
        }
      }

      return callback(resolvedSchema, path, parentSchema, parentKey);

    default:
      // Primitive types
      if (!includePrimitives) {
        return callback(resolvedSchema, path, parentSchema, parentKey);
      }

      return callback(resolvedSchema, path, parentSchema, parentKey);
  }
}

/**
 * Get zero value based on schema type
 */
export function getSchemaZeroValue(schema: AppSchema): any {
  const type = getSchemaType(schema);

  switch (type) {
    case "string":
      return "";
    case "integer":
    case "number":
      return 0;
    case "boolean":
      return false;
    case "null":
      return null;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
}

/**
 * Initialize schema data with defaults and zero values
 */
export function initializeSchemaData(
  schema: AppSchema,
  rootSchema?: AppSchema,
  maxDepth: number = 10
): any {
  // First, check if the root schema itself has examples
  if (schema.examples && schema.examples.length > 0) {
    return schema.examples[0];
  }

  // Otherwise, traverse the schema to build the data structure
  return traverseSchema(
    schema,
    (currentSchema) => {
      // For primitive types, use the priority: examples[0] > default > zero value
      if (currentSchema.examples && currentSchema.examples.length > 0) {
        return currentSchema.examples[0];
      } else if (currentSchema.default !== undefined) {
        return currentSchema.default;
      } else {
        return getSchemaZeroValue(currentSchema);
      }
    },
    {
      maxDepth,
      resolveRefs: true,
      includeArrays: true,
      includeObjects: true,
      includePrimitives: true,
    },
    rootSchema
  );
}

/**
 * Traverse schema to find and process fields
 * Optimized to handle $ref circular references while allowing object traversal to continue
 */
export function traverseSchemaForFields(
  schema: AppSchema,
  callback: SchemaTraversalCallback,
  options: SchemaTraversalOptions = {}
): any {
  return traverseSchemaForFieldsInternal(
    schema,
    callback,
    options,
    schema, // Use the same schema as root
    [],
    undefined,
    undefined,
    [] // Track current $def resolution chain for circular detection
  );
}

/**
 * Internal function for schema traversal with all internal parameters
 */
function traverseSchemaForFieldsInternal(
  schema: AppSchema,
  callback: SchemaTraversalCallback,
  options: SchemaTraversalOptions = {},
  rootSchema: AppSchema,
  path: string[] = [],
  parentSchema?: AppSchema,
  parentKey?: string,
  defChain: string[] = [] // Track current $def resolution chain for circular detection
): any {
  const {
    maxDepth = 10,
    resolveRefs = true,
    includeArrays = true,
    includeObjects = true,
    includePrimitives = true,
  } = options;

  // Check depth limit
  if (maxDepth <= 0) {
    return callback(schema, path, parentSchema, parentKey);
  }

  // Resolve $ref references if enabled
  let resolvedSchema = schema;
  let newDefChain = defChain;

  if (resolveRefs && rootSchema && schema.$ref) {
    const refPath = schema.$ref;

    // Only track $def references for circular detection
    if (refPath.startsWith("#/$defs/")) {
      // Check if this $def is already in the current resolution chain
      if (defChain.includes(refPath)) {
        // This is a circular reference in the current path
        console.warn(
          `Circular $def reference detected: ${refPath} at path: ${path.join(
            "."
          )}`
        );
        // Don't resolve this $ref, but continue with the current schema to find other fields
        resolvedSchema = schema; // Keep the original schema with $ref
      } else {
        // Add to the current resolution chain
        newDefChain = [...defChain, refPath];

        // Resolve the reference
        resolvedSchema = resolveSchemaRef(
          schema,
          rootSchema,
          maxDepth,
          new Set()
        );
      }
    } else {
      // For non-$defs references, just resolve normally
      resolvedSchema = resolveSchemaRef(
        schema,
        rootSchema,
        maxDepth,
        new Set()
      );
    }
  }

  const type = getSchemaType(resolvedSchema);

  // Handle different schema types
  switch (type) {
    case "object":
      if (!includeObjects) {
        return callback(resolvedSchema, path, parentSchema, parentKey);
      }

      // Call callback for the object itself first
      const objectResult = callback(
        resolvedSchema,
        path,
        parentSchema,
        parentKey
      );

      if (resolvedSchema.properties) {
        const result: Record<string, any> = {};

        Object.entries(resolvedSchema.properties).forEach(
          ([key, propSchema]) => {
            const newPath = [...path, key];
            result[key] = traverseSchemaForFieldsInternal(
              propSchema,
              callback,
              { ...options, maxDepth: maxDepth - 1 },
              rootSchema,
              newPath,
              resolvedSchema,
              key,
              newDefChain // Pass the updated defChain to continue tracking in this branch
            );
          }
        );

        return result;
      }

      return objectResult;

    case "array":
      if (!includeArrays) {
        return callback(resolvedSchema, path, parentSchema, parentKey);
      }

      if (resolvedSchema.items && maxDepth > 0) {
        if (Array.isArray(resolvedSchema.items)) {
          // Tuple array - process each item
          return resolvedSchema.items.map((item, index) => {
            const newPath = [...path, index.toString()];
            return traverseSchemaForFieldsInternal(
              item,
              callback,
              { ...options, maxDepth: maxDepth - 1 },
              rootSchema,
              newPath,
              resolvedSchema,
              index.toString(),
              newDefChain // Pass the updated defChain to continue tracking in this branch
            );
          });
        } else {
          // Regular array - process the items schema directly
          return traverseSchemaForFieldsInternal(
            resolvedSchema.items,
            callback,
            { ...options, maxDepth: maxDepth - 1 },
            rootSchema,
            path, // Don't add "items" to the path for regular arrays
            resolvedSchema,
            parentKey,
            newDefChain // Pass the updated defChain to continue tracking in this branch
          );
        }
      }

      return callback(resolvedSchema, path, parentSchema, parentKey);

    default:
      // Primitive types
      if (!includePrimitives) {
        return callback(resolvedSchema, path, parentSchema, parentKey);
      }

      return callback(resolvedSchema, path, parentSchema, parentKey);
  }
}

/**
 * Get all field paths from schema
 */
export function getSchemaFieldPaths(
  schema: AppSchema,
  rootSchema?: AppSchema,
  maxDepth: number = 10
): string[][] {
  const paths: string[][] = [];

  traverseSchema(
    schema,
    (currentSchema, path) => {
      if (isPrimitiveType(currentSchema)) {
        paths.push([...path]);
      }
      return null; // We don't care about the return value here
    },
    {
      maxDepth,
      resolveRefs: true,
      includeArrays: true,
      includeObjects: true,
      includePrimitives: true,
    },
    rootSchema
  );

  return paths;
}

/**
 * Validate schema data against schema definition
 */
export function validateSchemaData(
  data: any,
  schema: AppSchema,
  rootSchema?: AppSchema,
  maxDepth: number = 10
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  traverseSchema(
    schema,
    (currentSchema, path) => {
      const fieldPath = path.join(".");
      const value = getNestedValue(data, path);

      // Required field validation
      if (
        currentSchema.required &&
        (value === null || value === undefined || value === "")
      ) {
        errors.push(`Field '${fieldPath}' is required`);
        return;
      }

      // Skip validation for empty optional fields
      if (value === null || value === undefined || value === "") {
        return;
      }

      // Type-specific validation
      const type = getSchemaType(currentSchema);

      if (type === "string" && typeof value === "string") {
        if (
          currentSchema.minLength !== undefined &&
          value.length < currentSchema.minLength
        ) {
          errors.push(
            `Field '${fieldPath}' minimum length is ${currentSchema.minLength}`
          );
        }
        if (
          currentSchema.maxLength !== undefined &&
          value.length > currentSchema.maxLength
        ) {
          errors.push(
            `Field '${fieldPath}' maximum length is ${currentSchema.maxLength}`
          );
        }
      }

      if (
        (type === "integer" || type === "number") &&
        typeof value === "number"
      ) {
        if (
          currentSchema.minimum !== undefined &&
          value < currentSchema.minimum
        ) {
          errors.push(
            `Field '${fieldPath}' minimum value is ${currentSchema.minimum}`
          );
        }
        if (
          currentSchema.maximum !== undefined &&
          value > currentSchema.maximum
        ) {
          errors.push(
            `Field '${fieldPath}' maximum value is ${currentSchema.maximum}`
          );
        }
      }

      return null; // We don't care about the return value here
    },
    {
      maxDepth,
      resolveRefs: true,
      includeArrays: true,
      includeObjects: true,
      includePrimitives: true,
    },
    rootSchema
  );

  return { valid: errors.length === 0, errors };
}

/**
 * Get nested value from object using path array
 */
function getNestedValue(obj: any, path: string[]): any {
  let current = obj;

  for (const key of path) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Set nested value in object using path array
 */
export function setNestedValue(obj: any, path: string[], value: any): void {
  let current = obj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[path[path.length - 1]] = value;
}

/**
 * Flatten schema to key-value pairs
 */
export function flattenSchema(
  schema: AppSchema,
  rootSchema?: AppSchema,
  maxDepth: number = 10
): Record<string, AppSchema> {
  const flattened: Record<string, AppSchema> = {};

  traverseSchema(
    schema,
    (currentSchema, path) => {
      const key = path.join(".");
      flattened[key] = currentSchema;
      return null; // We don't care about the return value here
    },
    {
      maxDepth,
      resolveRefs: true,
      includeArrays: true,
      includeObjects: true,
      includePrimitives: true,
    },
    rootSchema
  );

  return flattened;
}

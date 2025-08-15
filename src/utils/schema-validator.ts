/**
 * Schema validation utilities
 * Provides tools to validate schema correctness and consistency
 */

import type {
  AppSchema,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "../types/schema";

export class SchemaValidator {
  /**
   * Validate a single schema for correctness
   */
  static validateSchema(
    schema: AppSchema,
    path: string = ""
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic schema structure validation
    if (
      !schema.type &&
      !schema.$ref &&
      !schema.allOf &&
      !schema.anyOf &&
      !schema.oneOf &&
      !schema.not
    ) {
      errors.push({
        path,
        message: "Schema must have a type, $ref, or logical operator",
        code: "MISSING_TYPE_OR_REF",
      });
    }

    // Type validation
    if (schema.type) {
      const validTypes = [
        "object",
        "array",
        "string",
        "number",
        "integer",
        "boolean",
        "null",
      ];
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];

      for (const type of types) {
        if (!validTypes.includes(type)) {
          errors.push({
            path: path ? `${path}.type` : "type",
            message: `Invalid type: ${type}. Valid types are: ${validTypes.join(
              ", "
            )}`,
            code: "INVALID_TYPE",
          });
        }
      }
    }

    // Object validation
    if (schema.type === "object" || schema.properties) {
      this.validateObjectSchema(schema, path, errors, warnings);
    }

    // Array validation
    if (schema.type === "array" || schema.items) {
      this.validateArraySchema(schema, path, errors, warnings);
    }

    // String validation
    if (schema.type === "string") {
      this.validateStringSchema(schema, path, errors, warnings);
    }

    // Number validation
    if (schema.type === "number" || schema.type === "integer") {
      this.validateNumberSchema(schema, path, errors, warnings);
    }

    // Required fields validation
    if (schema.required && Array.isArray(schema.required)) {
      this.validateRequiredFields(schema, path, errors, warnings);
    }

    // UI extensions validation
    if (schema.ui) {
      this.validateUIExtensions(schema.ui, path, errors, warnings);
    }

    // Business extensions validation
    if (schema.business) {
      this.validateBusinessExtensions(schema.business, path, errors, warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate object schema properties
   */
  private static validateObjectSchema(
    schema: AppSchema,
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (schema.properties && typeof schema.properties === "object") {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const propPath = path
          ? `${path}.properties.${propName}`
          : `properties.${propName}`;
        const propResult = this.validateSchema(propSchema, propPath);
        errors.push(...propResult.errors);
        warnings.push(...propResult.warnings);
      }
    }

    // Validate additionalProperties
    if (
      schema.additionalProperties !== undefined &&
      typeof schema.additionalProperties !== "boolean"
    ) {
      const addPropsPath = path
        ? `${path}.additionalProperties`
        : "additionalProperties";
      const addPropsResult = this.validateSchema(
        schema.additionalProperties,
        addPropsPath
      );
      errors.push(...addPropsResult.errors);
      warnings.push(...addPropsResult.warnings);
    }
  }

  /**
   * Validate array schema items
   */
  private static validateArraySchema(
    schema: AppSchema,
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (schema.items) {
      const itemsPath = path ? `${path}.items` : "items";
      if (Array.isArray(schema.items)) {
        for (let i = 0; i < schema.items.length; i++) {
          const itemResult = this.validateSchema(
            schema.items[i],
            `${itemsPath}[${i}]`
          );
          errors.push(...itemResult.errors);
          warnings.push(...itemResult.warnings);
        }
      } else {
        const itemResult = this.validateSchema(schema.items, itemsPath);
        errors.push(...itemResult.errors);
        warnings.push(...itemResult.warnings);
      }
    }

    // Validate array constraints
    if (schema.minItems !== undefined && schema.maxItems !== undefined) {
      if (schema.minItems > schema.maxItems) {
        errors.push({
          path: path ? `${path}.minItems` : "minItems",
          message: "minItems cannot be greater than maxItems",
          code: "INVALID_ARRAY_BOUNDS",
        });
      }
    }
  }

  /**
   * Validate string schema constraints
   */
  private static validateStringSchema(
    schema: AppSchema,
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Validate length constraints
    if (schema.minLength !== undefined && schema.maxLength !== undefined) {
      if (schema.minLength > schema.maxLength) {
        errors.push({
          path: path ? `${path}.minLength` : "minLength",
          message: "minLength cannot be greater than maxLength",
          code: "INVALID_STRING_BOUNDS",
        });
      }
    }

    // Validate pattern
    if (schema.pattern) {
      try {
        new RegExp(schema.pattern);
      } catch (e) {
        errors.push({
          path: path ? `${path}.pattern` : "pattern",
          message: `Invalid regex pattern: ${schema.pattern}`,
          code: "INVALID_REGEX_PATTERN",
        });
      }
    }

    // Validate format
    if (schema.format) {
      const validFormats = [
        "date-time",
        "date",
        "time",
        "duration",
        "email",
        "idn-email",
        "hostname",
        "idn-hostname",
        "ipv4",
        "ipv6",
        "uri",
        "uri-reference",
        "iri",
        "iri-reference",
        "uuid",
        "uri-template",
        "json-pointer",
        "relative-json-pointer",
        "regex",
      ];

      if (!validFormats.includes(schema.format)) {
        warnings.push({
          path: path ? `${path}.format` : "format",
          message: `Unknown format: ${
            schema.format
          }. Valid formats: ${validFormats.join(", ")}`,
          code: "UNKNOWN_FORMAT",
        });
      }
    }
  }

  /**
   * Validate number schema constraints
   */
  private static validateNumberSchema(
    schema: AppSchema,
    path: string,
    errors: ValidationError[],
    _warnings: ValidationWarning[]
  ): void {
    // Validate range constraints
    if (schema.minimum !== undefined && schema.maximum !== undefined) {
      if (schema.minimum > schema.maximum) {
        errors.push({
          path: path ? `${path}.minimum` : "minimum",
          message: "minimum cannot be greater than maximum",
          code: "INVALID_NUMBER_BOUNDS",
        });
      }
    }

    // Validate multipleOf
    if (schema.multipleOf !== undefined && schema.multipleOf <= 0) {
      errors.push({
        path: path ? `${path}.multipleOf` : "multipleOf",
        message: "multipleOf must be a positive number",
        code: "INVALID_MULTIPLE_OF",
      });
    }
  }

  /**
   * Validate required fields exist in properties
   */
  private static validateRequiredFields(
    schema: AppSchema,
    path: string,
    errors: ValidationError[],
    _warnings: ValidationWarning[]
  ): void {
    if (!schema.properties) {
      errors.push({
        path: path ? `${path}.required` : "required",
        message: "required fields specified but no properties defined",
        code: "REQUIRED_WITHOUT_PROPERTIES",
      });
      return;
    }

    if (!Array.isArray(schema.required)) {
      return;
    }

    for (const requiredField of schema.required) {
      if (!(requiredField in schema.properties)) {
        errors.push({
          path: path ? `${path}.required` : "required",
          message: `Required field '${requiredField}' not found in properties`,
          code: "REQUIRED_FIELD_NOT_IN_PROPERTIES",
        });
      }
    }
  }

  /**
   * Validate UI extensions
   */
  private static validateUIExtensions(
    ui: AppSchema["ui"],
    path: string,
    _errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!ui) return;

    const uiPath = path ? `${path}.ui` : "ui";

    // Validate component name
    if (ui.component) {
      const validComponents = [
        "text-input",
        "email-input",
        "number-input",
        "select",
        "toggle",
        "textarea",
        "checkbox",
        "radio",
        "date-picker",
        "time-picker",
        "file-upload",
        "form",
        "group",
      ];

      if (!validComponents.includes(ui.component)) {
        warnings.push({
          path: `${uiPath}.component`,
          message: `Unknown component: ${
            ui.component
          }. Valid components: ${validComponents.join(", ")}`,
          code: "UNKNOWN_UI_COMPONENT",
        });
      }
    }

    // Validate order is positive
    if (ui.order !== undefined && ui.order < 0) {
      warnings.push({
        path: `${uiPath}.order`,
        message: "UI order should be a positive number",
        code: "NEGATIVE_UI_ORDER",
      });
    }
  }

  /**
   * Validate business extensions
   */
  private static validateBusinessExtensions(
    business: AppSchema["business"],
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!business) return;

    const businessPath = path ? `${path}.business` : "business";

    // Validate version format
    if (business.version && !/^\d+\.\d+\.\d+$/.test(business.version)) {
      warnings.push({
        path: `${businessPath}.version`,
        message:
          "Version should follow semantic versioning format (e.g., 1.0.0)",
        code: "INVALID_VERSION_FORMAT",
      });
    }

    // Validate tags are strings
    if (business.tags && Array.isArray(business.tags)) {
      for (let i = 0; i < business.tags.length; i++) {
        if (typeof business.tags[i] !== "string") {
          errors.push({
            path: `${businessPath}.tags[${i}]`,
            message: "Tags must be strings",
            code: "INVALID_TAG_TYPE",
          });
        }
      }
    }
  }

  /**
   * Validate schema registry consistency
   */
  static validateRegistry(
    schemas: Record<string, AppSchema>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate each schema
    for (const [name, schema] of Object.entries(schemas)) {
      const result = this.validateSchema(schema, name);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    // Check for duplicate schema ids
    const names = Object.keys(schemas);
    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      errors.push({
        path: "",
        message: `Duplicate schema ids found: ${duplicates.join(", ")}`,
        code: "DUPLICATE_SCHEMA_IDS",
      });
    }

    // Check for circular references
    for (const [name, schema] of Object.entries(schemas)) {
      const circularRefs = this.findCircularReferences(schema, name, new Set());
      if (circularRefs.length > 0) {
        errors.push({
          path: name,
          message: `Circular references detected: ${circularRefs.join(" -> ")}`,
          code: "CIRCULAR_REFERENCE",
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Find circular references in schema
   */
  private static findCircularReferences(
    schema: AppSchema,
    currentPath: string,
    visited: Set<string>
  ): string[] {
    if (visited.has(currentPath)) {
      return [currentPath];
    }

    visited.add(currentPath);

    if (schema.$ref) {
      const refPath = schema.$ref.replace("#/", "");
      // For $ref, we need to check if the referenced path has been visited
      if (visited.has(refPath)) {
        return [currentPath, refPath];
      }
      // Note: In a real implementation, we would need to resolve the $ref
      // to the actual schema and continue validation. For now, we'll skip it.
      visited.delete(currentPath);
      return [];
    }

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const propPath = `${currentPath}.${propName}`;
        const circularRefs = this.findCircularReferences(
          propSchema,
          propPath,
          visited
        );
        if (circularRefs.length > 0) {
          return [currentPath, ...circularRefs];
        }
      }
    }

    visited.delete(currentPath);
    return [];
  }

  /**
   * Generate schema documentation
   */
  static generateDocumentation(
    schema: AppSchema,
    name: string = "Schema"
  ): string {
    let doc = `# ${name}\n\n`;

    if (schema.description) {
      doc += `${schema.description}\n\n`;
    }

    if (schema.type) {
      doc += `**Type:** ${
        Array.isArray(schema.type) ? schema.type.join(" | ") : schema.type
      }\n\n`;
    }

    if (schema.properties) {
      doc += "## Properties\n\n";
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        doc += `### ${propName}\n\n`;
        if (propSchema.title) {
          doc += `**Title:** ${propSchema.title}\n\n`;
        }
        if (propSchema.description) {
          doc += `${propSchema.description}\n\n`;
        }
        if (propSchema.type) {
          doc += `**Type:** ${
            Array.isArray(propSchema.type)
              ? propSchema.type.join(" | ")
              : propSchema.type
          }\n\n`;
        }
        if (propSchema.default !== undefined) {
          doc += `**Default:** ${JSON.stringify(propSchema.default)}\n\n`;
        }
        if (propSchema.enum) {
          doc += `**Allowed Values:** ${propSchema.enum
            .map((v) => JSON.stringify(v))
            .join(", ")}\n\n`;
        }
        // Check if this property is required (required is defined at object level)
        if (
          schema.required &&
          Array.isArray(schema.required) &&
          schema.required.includes(propName)
        ) {
          doc += `**Required:** Yes\n\n`;
        }
        doc += "---\n\n";
      }
    }

    return doc;
  }
}

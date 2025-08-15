/**
 * JSON Schema 2020-12 Draft TypeScript interfaces
 * Based on https://json-schema.org/draft/2020-12/schema
 */

// Core schema types
export type JSONSchemaType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "null";

// Basic schema interface
export interface JSONSchema {
  $schema?: string;
  $id?: string;
  $ref?: string;
  $anchor?: string;
  $dynamicAnchor?: string;
  $dynamicRef?: string;
  $vocabulary?: Record<string, boolean>;
  $comment?: string;
  $defs?: Record<string, JSONSchema>;

  // Type and content
  type?: JSONSchemaType | JSONSchemaType[];
  enum?: any[];
  const?: any;

  // String validation
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  format?: string;

  // Number validation
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number | boolean;
  minimum?: number;
  exclusiveMinimum?: number | boolean;

  // Array validation
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxContains?: number;
  minContains?: number;

  // Object validation
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  dependentRequired?: Record<string, string[]>;

  // Content and format
  contentEncoding?: string;
  contentMediaType?: string;
  contentSchema?: JSONSchema;

  // Metadata
  title?: string;
  description?: string;
  default?: any;
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: any[];

  // Conditional validation
  if?: JSONSchema;
  then?: JSONSchema;
  else?: JSONSchema;

  // Applicator keywords
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;

  // Object properties
  properties?: Record<string, JSONSchema>;
  patternProperties?: Record<string, JSONSchema>;
  additionalProperties?: JSONSchema | boolean;
  unevaluatedProperties?: JSONSchema | boolean;
  propertyNames?: JSONSchema;

  // Array items
  items?: JSONSchema | JSONSchema[];
  additionalItems?: JSONSchema | boolean;
  unevaluatedItems?: JSONSchema | boolean;
  contains?: JSONSchema;
  prefixItems?: JSONSchema[];

  // Dependent schemas
  dependentSchemas?: Record<string, JSONSchema>;

  // Legacy support (deprecated but still used)
  definitions?: Record<string, JSONSchema>;
  dependencies?: Record<string, JSONSchema | string[]>;
  $recursiveAnchor?: string;
  $recursiveRef?: string;
}

// Extended schema for our application
export interface AppSchema extends JSONSchema {
  // Custom extensions for our app
  ui?: {
    component?: string;
    order?: number;
    group?: string;
    advanced?: boolean;
    hidden?: boolean;
    readonly?: boolean;
    placeholder?: string;
    help?: string;
    validation?: {
      message?: string;
      async?: boolean;
    };
  };

  // Business logic extensions
  business?: {
    category?: string;
    tags?: string[];
    version?: string;
    deprecated?: boolean;
    migration?: {
      from?: string;
      to?: string;
      transform?: string;
    };
  };
}

// Schema registry interface
export interface SchemaRegistry {
  schemas: Record<string, AppSchema>;
  register(name: string, schema: AppSchema): void;
  get(name: string): AppSchema | undefined;
  list(): string[];
  validate(name: string, data: any): ValidationResult;
}

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
  schema?: AppSchema;
}

export interface ValidationWarning {
  path: string;
  message: string;
  code: string;
  schema?: AppSchema;
}

// Schema builder for fluent API
export class SchemaBuilder {
  private schema: AppSchema = {};

  static object(): SchemaBuilder {
    return new SchemaBuilder().type("object");
  }

  static array(): SchemaBuilder {
    return new SchemaBuilder().type("array");
  }

  static string(): SchemaBuilder {
    return new SchemaBuilder().type("string");
  }

  static number(): SchemaBuilder {
    return new SchemaBuilder().type("number");
  }

  static integer(): SchemaBuilder {
    return new SchemaBuilder().type("integer");
  }

  static boolean(): SchemaBuilder {
    return new SchemaBuilder().type("boolean");
  }

  type(type: JSONSchemaType): SchemaBuilder {
    this.schema.type = type;
    return this;
  }

  title(title: string): SchemaBuilder {
    this.schema.title = title;
    return this;
  }

  description(description: string): SchemaBuilder {
    this.schema.description = description;
    return this;
  }

  required(fields?: string[]): SchemaBuilder {
    this.schema.required = fields || [];
    return this;
  }

  default(value: any): SchemaBuilder {
    this.schema.default = value;
    return this;
  }

  enum(values: any[]): SchemaBuilder {
    this.schema.enum = values;
    return this;
  }

  min(min: number): SchemaBuilder {
    if (this.schema.type === "string") {
      this.schema.minLength = min;
    } else if (
      this.schema.type === "number" ||
      this.schema.type === "integer"
    ) {
      this.schema.minimum = min;
    } else if (this.schema.type === "array") {
      this.schema.minItems = min;
    } else if (this.schema.type === "object") {
      this.schema.minProperties = min;
    }
    return this;
  }

  max(max: number): SchemaBuilder {
    if (this.schema.type === "string") {
      this.schema.maxLength = max;
    } else if (
      this.schema.type === "number" ||
      this.schema.type === "integer"
    ) {
      this.schema.maximum = max;
    } else if (this.schema.type === "array") {
      this.schema.maxItems = max;
    } else if (this.schema.type === "object") {
      this.schema.maxProperties = max;
    }
    return this;
  }

  minimum(min: number): SchemaBuilder {
    if (this.schema.type === "number" || this.schema.type === "integer") {
      this.schema.minimum = min;
    }
    return this;
  }

  maximum(max: number): SchemaBuilder {
    if (this.schema.type === "number" || this.schema.type === "integer") {
      this.schema.maximum = max;
    }
    return this;
  }

  pattern(pattern: string): SchemaBuilder {
    this.schema.pattern = pattern;
    return this;
  }

  format(format: string): SchemaBuilder {
    this.schema.format = format;
    return this;
  }

  properties(props: Record<string, AppSchema>): SchemaBuilder {
    this.schema.properties = props;
    return this;
  }

  items(items: AppSchema | AppSchema[]): SchemaBuilder {
    this.schema.items = items;
    return this;
  }

  ui(ui: AppSchema["ui"]): SchemaBuilder {
    this.schema.ui = ui;
    return this;
  }

  business(business: AppSchema["business"]): SchemaBuilder {
    this.schema.business = business;
    return this;
  }

  build(): AppSchema {
    return { ...this.schema };
  }
}

// Schema registry implementation
export class SchemaRegistryImpl implements SchemaRegistry {
  schemas: Record<string, AppSchema> = {};

  register(name: string, schema: AppSchema): void {
    this.schemas[name] = schema;
  }

  get(name: string): AppSchema | undefined {
    return this.schemas[name];
  }

  list(): string[] {
    return Object.keys(this.schemas);
  }

  validate(name: string, data: any): ValidationResult {
    const schema = this.get(name);
    if (!schema) {
      return {
        valid: false,
        errors: [
          {
            path: "",
            message: `Schema '${name}' not found`,
            code: "SCHEMA_NOT_FOUND",
          },
        ],
        warnings: [],
      };
    }

    // Basic validation implementation
    // In a real application, you would use a proper JSON Schema validator
    return this.validateSchema(schema, data, "");
  }

  private validateSchema(
    schema: AppSchema,
    data: any,
    path: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Type validation
    if (schema.type) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      const actualType = this.getType(data);

      if (!types.includes(actualType)) {
        errors.push({
          path,
          message: `Expected type ${types.join(" or ")}, got ${actualType}`,
          code: "TYPE_MISMATCH",
          schema,
        });
      }
    }

    // Required field validation
    if (schema.required && schema.type === "object" && schema.properties) {
      for (const requiredField of schema.required) {
        if (!(requiredField in data)) {
          errors.push({
            path: path ? `${path}.${requiredField}` : requiredField,
            message: `Required field '${requiredField}' is missing`,
            code: "REQUIRED_FIELD_MISSING",
            schema,
          });
        }
      }
    }

    // String validation
    if (schema.type === "string" && typeof data === "string") {
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        errors.push({
          path,
          message: `String length ${data.length} is less than minimum ${schema.minLength}`,
          code: "STRING_TOO_SHORT",
          schema,
        });
      }

      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        errors.push({
          path,
          message: `String length ${data.length} is greater than maximum ${schema.maxLength}`,
          code: "STRING_TOO_LONG",
          schema,
        });
      }

      if (schema.pattern) {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(data)) {
          errors.push({
            path,
            message: `String does not match pattern ${schema.pattern}`,
            code: "PATTERN_MISMATCH",
            schema,
          });
        }
      }
    }

    // Number validation
    if (
      (schema.type === "number" || schema.type === "integer") &&
      typeof data === "number"
    ) {
      if (schema.minimum !== undefined && data < schema.minimum) {
        errors.push({
          path,
          message: `Value ${data} is less than minimum ${schema.minimum}`,
          code: "NUMBER_TOO_SMALL",
          schema,
        });
      }

      if (schema.maximum !== undefined && data > schema.maximum) {
        errors.push({
          path,
          message: `Value ${data} is greater than maximum ${schema.maximum}`,
          code: "NUMBER_TOO_LARGE",
          schema,
        });
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push({
        path,
        message: `Value must be one of: ${schema.enum.join(", ")}`,
        code: "ENUM_MISMATCH",
        schema,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private getType(value: any): JSONSchemaType {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    if (typeof value === "string") return "string";
    if (typeof value === "number") {
      return Number.isInteger(value) ? "integer" : "number";
    }
    if (typeof value === "boolean") return "boolean";
    return "string"; // fallback
  }
}

// Global schema registry instance
export const globalSchemaRegistry = new SchemaRegistryImpl();

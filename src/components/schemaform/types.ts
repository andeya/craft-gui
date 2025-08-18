import type { AppSchema } from "../../types/schema";

// Common types used across schema form components
export type FieldValue =
  | string
  | number
  | boolean
  | unknown[]
  | Record<string, unknown>
  | null
  | undefined;

export type ValidationRule = (val: any) => boolean | string;

export type FormData = Record<string, any>;
export type ValidationErrors = Map<string, string>;

// Compact mode configuration
export interface CompactConfig {
  compact?: boolean; // Whether to use compact mode (auto-determined if not specified)
  show: boolean; // Whether to show the compact toggle button
}

// Utility function to parse compact configuration
export function parseCompactConfig(
  compact?: boolean | CompactConfig,
  isMobile: boolean = false
): { compact: boolean; show: boolean } {
  // If compact is a boolean, convert to CompactConfig
  if (typeof compact === "boolean") {
    return {
      compact,
      show: false, // Don't show toggle by default for boolean
    };
  }

  // If compact is a CompactConfig object, use it directly
  if (compact && typeof compact === "object") {
    return {
      compact: compact.compact !== undefined ? compact.compact : !isMobile, // Auto-determine if not specified
      show: compact.show,
    };
  }

  // Default behavior: mobile = {compact: false, show: false}, desktop = {compact: true, show: false}
  return {
    compact: !isMobile, // true for desktop, false for mobile
    show: false,
  };
}

// Field layout configuration
export interface FieldLayoutConfig {
  fieldPath?: string; // Field path (e.g., "user.name", "profile.email") - undefined for root level
  columns: number; // Number of columns for sub-fields of this field
  span?: number; // Number of columns this field spans in the grid (optional)
}

// SchemaField component types
export interface SchemaFieldProps {
  schema: AppSchema;
  modelValue: FieldValue;
  rootSchema: AppSchema | null;
  isModified: boolean;
  parentKey: string;
  checkNestedModification: (parentKey: string, childKey: string) => boolean;
  compact?: boolean;
  fieldPath?: string; // Full field path (e.g., "user.name", "profile.email")
  columns?: number; // Number of columns for nested fields
}

export interface SchemaFieldEmits {
  "update:model-value": [value: FieldValue];
  "validation-error": [error: string];
  "validation-success": [];
  validate: [result: { valid: boolean; error?: string }]; // 触发校验并返回结果
}

// SchemaApiForm component types
export interface SchemaApiFormProps {
  // Core form properties
  schemaId: string;
  modelValue?: FormData;
  initialData?: FormData;

  // Form state
  disabled?: boolean;
  readonly?: boolean;

  // Layout and display
  columns?: number; // 0=auto, 1=single column, 2=double column, 3=triple column
  compact?: boolean | CompactConfig; // Compact mode configuration
  showHeader?: boolean;

  // Action buttons configuration
  showSubmitButton?: boolean;
  showResetButton?: boolean; // Reset form to initial state
  showClearButton?: boolean; // Clear all form data

  // Button labels and icons
  submitButtonText?: string;
  submitButtonIcon?: string;
  resetButtonText?: string;
  resetButtonIcon?: string;
  clearButtonText?: string;
  clearButtonIcon?: string;

  // Confirmation dialogs
  showResetConfirmation?: boolean; // Show confirmation dialog for reset
  showClearConfirmation?: boolean; // Show confirmation dialog for clear

  // Container styling
  maxHeight?: string;

  // Modification tracking
  showModificationIndicator?: boolean;

  // Field layout configuration
  fieldLayoutConfig?: FieldLayoutConfig[];
}

export interface SchemaApiFormEmits {
  // Standard form events
  "update:model-value": [data: FormData];

  // Submit events - Standard form pattern with callback
  submit: [
    data: FormData,
    callback: (success: boolean, result?: any, error?: string) => void
  ];

  // Form actions
  reset: [originalData: FormData]; // Emitted when form is reset to initial state
  clear: []; // Emitted when form is cleared

  // Validation events
  "validation-error": [errors: ValidationErrors];
  "validation-success": [];

  // Schema events
  "schema-loaded": [schema: AppSchema];
  "schema-error": [error: string];
}

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
  loading?: boolean;
  readonly?: boolean;

  // Layout and display
  columns?: number; // 0=auto, 1=single column, 2=double column, 3=triple column
  compact?: boolean;
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

  // Form styling
  labelWidth?: string;
  labelPosition?: "left" | "top" | "right";
  size?: "small" | "medium" | "large";

  // Notification control
  showSuccessNotification?: boolean;
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
  submit: [
    data: FormData,
    callback: (success: boolean, message?: string) => void
  ];
  reset: [originalData: FormData]; // Emitted when form is reset to initial state
  clear: []; // Emitted when form is cleared

  // Validation events
  "validation-error": [errors: ValidationErrors];
  "validation-success": [];

  // Schema events
  "schema-loaded": [schema: AppSchema];
  "schema-error": [error: string];
}

// SchemaDataForm component types (if needed)
export interface SchemaDataFormProps {
  // Add SchemaDataForm specific props here
  schemaId?: string;
  schema?: AppSchema;
  modelValue?: FormData;
  initialData?: FormData;
  disabled?: boolean;
  loading?: boolean;
  readonly?: boolean;
  columns?: number;
  compact?: boolean;
  showHeader?: boolean;
  showNewButton?: boolean;
  showReloadButton?: boolean;
  showSaveButton?: boolean;
  showDeleteButton?: boolean;
  title?: string;
  description?: string;

  // Field layout configuration
  fieldLayoutConfig?: FieldLayoutConfig[];
}

export interface SchemaDataFormEmits {
  // Add SchemaDataForm specific emits here
  "update:model-value": [data: FormData];
  submit: [data: FormData];
  cancel: [];
  new: [];
  reload: [];
  save: [data: FormData];
  delete: [key: number];
  "validation-error": [errors: ValidationErrors];
  "validation-success": [];
  "schema-loaded": [schema: AppSchema];
  "schema-error": [error: string];
}

// Utility types for form validation
export interface ValidationContext {
  fieldName: string;
  schema: AppSchema;
  value: unknown;
  fieldPath?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Component instance types for refs
export interface SchemaApiFormInstance {
  getFormData: () => FormData;
  setFormData: (data: FormData) => void;
  validate: () => boolean;
  submit: () => Promise<void>;
  reset: () => void;
  loadSchema: () => Promise<void>;
}

export interface SchemaDataFormInstance {
  getFormData: () => FormData;
  setFormData: (data: FormData) => void;
  validate: () => boolean;
  submit: () => Promise<void>;
  reset: () => void;
  createNew: () => void;
  reloadData: () => Promise<void>;
  saveData: () => Promise<void>;
  deleteData: () => Promise<void>;
}

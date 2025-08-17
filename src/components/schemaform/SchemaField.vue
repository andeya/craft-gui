<template>
  <div class="schema-field" :class="{ 'compact-mode': compact }">
    <!-- Field Label and Description -->
    <div class="field-header">
      <label class="text-base font-medium q-mb-sm block">
        {{ fieldDisplayName }}
        <span v-if="isFieldRequired" class="text-red-500"> *</span>
        <span
          v-if="resolvedSchema.description && !compact"
          class="field-description"
        >
          {{ resolvedSchema.description }}
        </span>
      </label>
    </div>

    <!-- Validation Error Message -->
    <div v-if="displayValidationError" class="validation-error q-mb-sm">
      <QIcon name="error" color="red" size="sm" />
      <span class="text-red-600 text-sm q-ml-xs">{{
        displayValidationError
      }}</span>
    </div>

    <!-- Input Field with Modification Indicator -->
    <div
      class="field-input-wrapper"
      :class="{ 'field-modified': isThisFieldModified }"
    >
      <!-- String Input -->
      <QInput
        v-if="isStringInput"
        ref="stringInputRef"
        :name="props.fieldPath || props.parentKey || 'field'"
        :model-value="stringValue"
        :placeholder="inputPlaceholder"
        :disabled="resolvedSchema.readOnly"
        :rules="validationRules"
        :dense="compact"
        :outlined="compact"
        @update:model-value="handleValueChange"
        @blur="validateField"
      />

      <!-- Select Input -->
      <QSelect
        v-else-if="isSelectInput"
        ref="selectInputRef"
        :name="props.fieldPath || props.parentKey || 'field'"
        :model-value="stringValue"
        :options="resolvedSchema.enum || []"
        :label="fieldDisplayName"
        :disabled="resolvedSchema.readOnly"
        :rules="validationRules"
        :dense="compact"
        :outlined="compact"
        @update:model-value="handleValueChange"
        @blur="validateField"
      />

      <!-- Number Input -->
      <QInput
        v-else-if="isNumberInput"
        ref="numberInputRef"
        :name="props.fieldPath || props.parentKey || 'field'"
        :model-value="numberValue"
        type="number"
        :min="resolvedSchema.minimum"
        :max="resolvedSchema.maximum"
        :step="resolvedSchema.type === 'integer' ? 1 : 'any'"
        :placeholder="inputPlaceholder"
        :disabled="resolvedSchema.readOnly"
        :rules="validationRules"
        :dense="compact"
        :outlined="compact"
        @update:model-value="handleValueChange"
        @blur="validateField"
      />

      <!-- Boolean Input -->
      <QToggle
        v-else-if="isBooleanInput"
        :model-value="booleanValue"
        :label="fieldDisplayName"
        :disabled="resolvedSchema.readOnly"
        :dense="compact"
        @update:model-value="handleValueChange"
      />
    </div>

    <!-- Object Input -->
    <div v-if="isObjectType" class="object-container">
      <div v-if="resolvedSchema.properties" class="q-ml-md q-mt-sm">
        <div
          class="object-fields-container"
          :class="`columns-${props.columns}`"
        >
          <div
            v-for="fieldInfo in objectFieldInfos"
            :key="fieldInfo.key"
            class="object-field-item"
          >
            <SchemaField
              :schema="fieldInfo.schema"
              :root-schema="props.rootSchema"
              :model-value="fieldInfo.value"
              :is-modified="isNestedFieldModified(fieldInfo.key)"
              :parent-key="fieldInfo.key"
              :check-nested-modification="props.checkNestedModification"
              :compact="compact"
              :field-path="buildFieldPath(props.parentKey || '', fieldInfo.key)"
              @update:model-value="
                handleNestedValueUpdate(fieldInfo.key, $event)
              "
              @validation-error="handleNestedValidationError"
              @validation-success="handleNestedValidationSuccess"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Array Input -->
    <div v-if="isArrayType" class="array-container">
      <QInput
        ref="arrayInputRef"
        :name="props.fieldPath || props.parentKey || 'field'"
        type="textarea"
        v-model="arrayStringValue"
        :placeholder="inputPlaceholder"
        :rows="5"
        :disabled="resolvedSchema.readOnly"
        :rules="validationRules"
        @update:model-value="handleArrayValueUpdate"
        @blur="validateField"
      />
      <div class="text-caption text-grey-6 q-mt-xs">
        Enter a valid JSON array
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { AppSchema } from "../../types/schema";

import type {
  FieldValue,
  ValidationRule,
  SchemaFieldProps,
  SchemaFieldEmits,
} from "./types";
import {
  resolveSchemaRef,
  getSchemaType,
  traverseSchemaForFields,
} from "../../utils/schema-utils";
import { getFieldName, buildFieldPath } from "./layout-utils";

const props = withDefaults(defineProps<SchemaFieldProps>(), {
  rootSchema: null,
  isModified: false,
  parentKey: "",
  checkNestedModification: () => false,
  compact: false,
  fieldPath: "",
  columns: 1,
});

const emit = defineEmits<SchemaFieldEmits>();

// Component reference types
interface InputRef {
  validate: () => boolean | string;
  setTouched: (touched: boolean) => void;
  clearValidation: () => void;
}

// Internal state
const internalValue = ref<FieldValue>(props.modelValue);
const arrayStringValue = ref("");
const validationError = ref("");

// Watch for modelValue changes to update internalValue
watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue;
  },
  { immediate: true }
);

// Computed properties
const resolvedSchema = computed((): AppSchema => {
  // Resolve $ref references using utility function
  if (props.schema && props.rootSchema) {
    return resolveSchemaRef(props.schema, props.rootSchema);
  }
  return props.schema;
});

const isObjectType = computed((): boolean => {
  const value = props.modelValue ?? resolvedSchema.value.default;
  return (
    resolvedSchema.value.type === "object" ||
    (typeof value === "object" && value !== null && !Array.isArray(value))
  );
});

const isArrayType = computed((): boolean => {
  const value = props.modelValue ?? resolvedSchema.value.default;
  return resolvedSchema.value.type === "array" || Array.isArray(value);
});

const isStringInput = computed((): boolean => {
  return resolvedSchema.value.type === "string" && !resolvedSchema.value.enum;
});

const isSelectInput = computed((): boolean => {
  return resolvedSchema.value.type === "string" && !!resolvedSchema.value.enum;
});

const isNumberInput = computed((): boolean => {
  return (
    resolvedSchema.value.type === "integer" ||
    resolvedSchema.value.type === "number"
  );
});

const isBooleanInput = computed((): boolean => {
  return resolvedSchema.value.type === "boolean";
});

const isThisFieldModified = computed((): boolean => {
  return props.isModified;
});

const fieldDisplayName = computed((): string => {
  // Use schema title first, then fallback to the field name extracted from fieldPath
  const fallbackName = getFieldName(props.fieldPath);
  return resolvedSchema.value.title || fallbackName;
});

const inputPlaceholder = computed((): string => {
  return resolvedSchema.value.description || "Enter value";
});

// Check if this field is required
const isFieldRequired = computed((): boolean => {
  if (props.parentKey && props.rootSchema) {
    // For root-level fields (like "args", "cookie")
    if (props.rootSchema.required && Array.isArray(props.rootSchema.required)) {
      return props.rootSchema.required.includes(props.parentKey);
    }

    // For nested fields (like "groupid", "parentid"), check if the field is in the parent object's required array
    if (props.fieldPath) {
      // Extract the parent path from fieldPath (e.g., "args.groupid" -> "args")
      const pathParts = props.fieldPath.split(".");
      if (pathParts.length > 1) {
        const parentPath = pathParts.slice(0, -1).join(".");
        const fieldName = pathParts[pathParts.length - 1];

        // Get the parent object's schema by traversing the path
        let parentSchema = props.rootSchema;
        for (const part of parentPath.split(".")) {
          if (parentSchema.properties && parentSchema.properties[part]) {
            parentSchema = resolveSchemaRef(
              parentSchema.properties[part],
              props.rootSchema
            );
          } else {
            break;
          }
        }

        if (
          parentSchema &&
          parentSchema.required &&
          Array.isArray(parentSchema.required)
        ) {
          return parentSchema.required.includes(fieldName);
        }
      }
    }
  }
  return false;
});

// Use internal validation error
const displayValidationError = computed(() => {
  return validationError.value;
});

// Generate object field infos using schema traversal
const objectFieldInfos = computed(() => {
  if (!isObjectType.value || !resolvedSchema.value.properties) return [];

  const fieldInfos: Array<{
    key: string;
    schema: AppSchema;
    value: any;
  }> = [];

  traverseSchemaForFields(
    resolvedSchema.value,
    (currentSchema, path) => {
      // Only process direct properties of this object
      if (path.length === 1) {
        const key = path[0];
        fieldInfos.push({
          key,
          schema: currentSchema,
          value: getNestedValue(key),
        });
      }
      return null; // We don't care about the return value here
    },
    {
      maxDepth: 1, // Only one level deep for object properties
      resolveRefs: true,
      includeArrays: true,
      includeObjects: true,
      includePrimitives: true,
    }
  );

  return fieldInfos;
});

// Value conversions for different input types
const stringValue = computed((): string => {
  return internalValue.value !== undefined && internalValue.value !== null
    ? String(internalValue.value)
    : "";
});

const numberValue = computed((): number => {
  return internalValue.value !== undefined && internalValue.value !== null
    ? Number(internalValue.value)
    : 0;
});

const booleanValue = computed((): boolean => {
  return Boolean(internalValue.value);
});

// Type conversion utilities
const convertValueToSchemaType = (value: any, schemaType: string): any => {
  if (value === null || value === undefined || value === "") {
    return schemaType === "boolean"
      ? false
      : schemaType === "integer" || schemaType === "number"
      ? 0
      : "";
  }

  switch (schemaType) {
    case "string":
      return String(value);
    case "integer":
      const intValue = parseInt(value, 10);
      return isNaN(intValue) ? 0 : intValue;
    case "number":
      const numValue = parseFloat(value);
      return isNaN(numValue) ? 0 : numValue;
    case "boolean":
      if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
      }
      return Boolean(value);
    case "array":
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return Array.isArray(value) ? value : [];
    case "object":
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return typeof parsed === "object" && !Array.isArray(parsed)
            ? parsed
            : {};
        } catch {
          return {};
        }
      }
      return typeof value === "object" && !Array.isArray(value) ? value : {};
    default:
      return value;
  }
};

const getCurrentSchemaType = (): string => {
  return getSchemaType(resolvedSchema.value);
};

// Unified validation function
const validateValue = (value: any): { valid: boolean; error?: string } => {
  const schema = resolvedSchema.value;

  // For object types, we need to validate the object's required fields
  if (schema.type === "object") {
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredField of schema.required) {
        const fieldValue =
          value && typeof value === "object" && !Array.isArray(value)
            ? (value as Record<string, any>)[requiredField]
            : undefined;

        if (
          fieldValue === null ||
          fieldValue === undefined ||
          fieldValue === ""
        ) {
          return {
            valid: false,
            error: `Field '${requiredField}' is required`,
          };
        }
      }
    }
    return { valid: true };
  }

  // Check if this field is required
  let isRequired = false;

  if (props.parentKey && props.rootSchema) {
    // For root-level fields (like "args", "cookie")
    if (props.rootSchema.required && Array.isArray(props.rootSchema.required)) {
      isRequired = props.rootSchema.required.includes(props.parentKey);
    }

    // For nested fields (like "groupid", "parentid"), check if the field is in the parent object's required array
    if (!isRequired && props.fieldPath) {
      // Extract the parent path from fieldPath (e.g., "args.groupid" -> "args")
      const pathParts = props.fieldPath.split(".");
      if (pathParts.length > 1) {
        const parentPath = pathParts.slice(0, -1).join(".");
        const fieldName = pathParts[pathParts.length - 1];

        // Get the parent object's schema by traversing the path
        let parentSchema = props.rootSchema;
        for (const part of parentPath.split(".")) {
          if (parentSchema.properties && parentSchema.properties[part]) {
            parentSchema = resolveSchemaRef(
              parentSchema.properties[part],
              props.rootSchema
            );
          } else {
            break;
          }
        }

        if (
          parentSchema &&
          parentSchema.required &&
          Array.isArray(parentSchema.required)
        ) {
          isRequired = parentSchema.required.includes(fieldName);
        }
      }
    }
  }

  if (isRequired && (value === null || value === undefined || value === "")) {
    return {
      valid: false,
      error: "This field is required",
    };
  }

  // If not required or has value, continue with other validations
  if (value === null || value === undefined || value === "") {
    return { valid: true };
  }

  // Type-specific validation
  if (schema.type === "string" && typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      return {
        valid: false,
        error: `Minimum length is ${schema.minLength}`,
      };
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      return {
        valid: false,
        error: `Maximum length is ${schema.maxLength}`,
      };
    }
    if (
      schema.pattern !== undefined &&
      !new RegExp(schema.pattern).test(value)
    ) {
      return {
        valid: false,
        error: `Does not match pattern: ${schema.pattern}`,
      };
    }
    if (schema.enum !== undefined && !schema.enum.includes(value)) {
      return {
        valid: false,
        error: `Must be one of: ${schema.enum.join(", ")}`,
      };
    }
  }

  if (schema.type === "integer" || schema.type === "number") {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return {
        valid: false,
        error: "Must be a valid number",
      };
    }
    if (schema.minimum !== undefined && numValue < schema.minimum) {
      return {
        valid: false,
        error: `Minimum value is ${schema.minimum}`,
      };
    }
    if (schema.maximum !== undefined && numValue > schema.maximum) {
      return {
        valid: false,
        error: `Maximum value is ${schema.maximum}`,
      };
    }
  }

  // Array validation
  if (schema.type === "array") {
    if (!Array.isArray(value)) {
      return {
        valid: false,
        error: "Must be a valid array",
      };
    }
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      return {
        valid: false,
        error: `Minimum ${schema.minItems} items required`,
      };
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      return {
        valid: false,
        error: `Maximum ${schema.maxItems} items allowed`,
      };
    }

    // Validate array items if items schema is defined
    if (schema.items) {
      const itemSchema = Array.isArray(schema.items)
        ? schema.items[0]
        : schema.items;
      for (let i = 0; i < value.length; i++) {
        const itemValue = value[i];

        // Type validation
        if (itemSchema.type === "string" && typeof itemValue !== "string") {
          return {
            valid: false,
            error: `Item ${i + 1} must be a string`,
          };
        }
        if (itemSchema.type === "number" && typeof itemValue !== "number") {
          return {
            valid: false,
            error: `Item ${i + 1} must be a number`,
          };
        }
        if (
          itemSchema.type === "integer" &&
          (typeof itemValue !== "number" || !Number.isInteger(itemValue))
        ) {
          return {
            valid: false,
            error: `Item ${i + 1} must be an integer`,
          };
        }
        if (itemSchema.type === "boolean" && typeof itemValue !== "boolean") {
          return {
            valid: false,
            error: `Item ${i + 1} must be a boolean`,
          };
        }

        // Additional validations for strings
        if (itemSchema.type === "string" && typeof itemValue === "string") {
          if (
            itemSchema.minLength !== undefined &&
            itemValue.length < itemSchema.minLength
          ) {
            return {
              valid: false,
              error: `Item ${i + 1}: minimum length is ${itemSchema.minLength}`,
            };
          }
          if (
            itemSchema.maxLength !== undefined &&
            itemValue.length > itemSchema.maxLength
          ) {
            return {
              valid: false,
              error: `Item ${i + 1}: maximum length is ${itemSchema.maxLength}`,
            };
          }
          if (
            itemSchema.pattern !== undefined &&
            !new RegExp(itemSchema.pattern).test(itemValue)
          ) {
            return {
              valid: false,
              error: `Item ${i + 1}: does not match pattern`,
            };
          }
          if (
            itemSchema.enum !== undefined &&
            !itemSchema.enum.includes(itemValue)
          ) {
            return {
              valid: false,
              error: `Item ${i + 1}: must be one of ${itemSchema.enum.join(
                ", "
              )}`,
            };
          }
        }

        // Additional validations for numbers
        if (
          (itemSchema.type === "number" || itemSchema.type === "integer") &&
          typeof itemValue === "number"
        ) {
          if (
            itemSchema.minimum !== undefined &&
            itemValue < itemSchema.minimum
          ) {
            return {
              valid: false,
              error: `Item ${i + 1}: minimum value is ${itemSchema.minimum}`,
            };
          }
          if (
            itemSchema.maximum !== undefined &&
            itemValue > itemSchema.maximum
          ) {
            return {
              valid: false,
              error: `Item ${i + 1}: maximum value is ${itemSchema.maximum}`,
            };
          }
        }
      }
    }
  }

  // Boolean validation
  if (schema.type === "boolean") {
    if (typeof value !== "boolean") {
      return {
        valid: false,
        error: "Must be a boolean value",
      };
    }
  }

  return { valid: true };
};

// Validation rules for Quasar
const validationRules = computed((): ValidationRule[] => {
  const rules: ValidationRule[] = [];

  // Add custom validation rule that uses our unified validation function
  rules.push((val: any): boolean | string => {
    const result = validateValue(val);
    return result.valid || result.error || "Validation failed";
  });

  return rules;
});

// Watch for prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    const value = newValue ?? resolvedSchema.value.default;
    internalValue.value = value;

    if (isArrayType.value) {
      try {
        arrayStringValue.value = JSON.stringify(value, null, 2);
      } catch (error) {
        arrayStringValue.value = String(value);
      }
    }
  },
  { immediate: true }
);

// Validation function
const validateField = (): boolean => {
  const result = validateValue(internalValue.value);

  if (result.valid) {
    validationError.value = "";
    emit("validation-success");
    return true;
  } else {
    validationError.value = result.error || "";
    emit("validation-error", validationError.value);
    return false;
  }
};

// Refs for input components
const stringInputRef = ref<InputRef | null>(null);
const selectInputRef = ref<InputRef | null>(null);
const numberInputRef = ref<InputRef | null>(null);
const arrayInputRef = ref<InputRef | null>(null);

// Method to trigger validation and return result
const triggerValidation = (): { valid: boolean; error?: string } => {
  // Get the appropriate input ref based on the field type
  let inputRef: any = null;
  if (isStringInput.value) {
    inputRef = stringInputRef.value;
  } else if (isSelectInput.value) {
    inputRef = selectInputRef.value;
  } else if (isNumberInput.value) {
    inputRef = numberInputRef.value;
  } else if (isArrayType.value) {
    inputRef = arrayInputRef.value;
  }

  // If we have an input ref, use Quasar's validate method and force validation display
  if (inputRef && typeof inputRef.validate === "function") {
    // Force the field to be "touched" so validation errors will show
    if (inputRef.setTouched) {
      inputRef.setTouched(true);
    }

    const validationResult = inputRef.validate();
    return {
      valid: validationResult === true,
      error: validationResult === true ? undefined : validationResult,
    };
  }

  // Fallback to unified validation function
  return validateValue(internalValue.value);
};

// Value change handlers
const handleValueChange = (value: FieldValue): void => {
  const schemaType = getCurrentSchemaType();
  const processedValue = convertValueToSchemaType(value, schemaType);

  internalValue.value = processedValue;
  validateField(); // Still validate for UI feedback, but don't block updates

  // Always emit update:model-value, even if validation fails
  // This allows users to clear fields and reset them later
  emit("update:model-value", processedValue);
};

const handleArrayValueUpdate = (value: string | number | null): void => {
  const processedValue = convertValueToSchemaType(value, "array");

  internalValue.value = processedValue;
  if (validateField()) {
    emit("update:model-value", processedValue);
  }
};

// Nested object helpers
const getNestedValue = (key: string): FieldValue => {
  if (
    !props.modelValue ||
    typeof props.modelValue !== "object" ||
    Array.isArray(props.modelValue)
  ) {
    return undefined;
  }
  return (props.modelValue as Record<string, any>)[key];
};

const handleNestedValueUpdate = (key: string, value: FieldValue): void => {
  const currentValue = props.modelValue || {};
  if (typeof currentValue !== "object" || Array.isArray(currentValue)) {
    return;
  }
  const updatedValue = {
    ...(currentValue as Record<string, any>),
    [key]: value,
  };
  internalValue.value = updatedValue;
  if (validateField()) {
    emit("update:model-value", updatedValue);
  }
};

const isNestedFieldModified = (key: string): boolean => {
  // Check if this specific nested field is modified
  if (props.parentKey && props.checkNestedModification) {
    return props.checkNestedModification(props.parentKey, key);
  }
  return false;
};

const handleNestedValidationError = (error: string): void => {
  emit("validation-error", error);
};

const handleNestedValidationSuccess = (): void => {
  emit("validation-success");
};

// Expose methods for parent components
defineExpose({
  triggerValidation,
  validateField,
  clearValidation: () => {
    validationError.value = "";
  },
  stringInputRef,
  selectInputRef,
  numberInputRef,
  arrayInputRef,
});
</script>

<style scoped>
.schema-field {
  margin-bottom: 0.25rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  height: 100%; /* Ensure full height for grid alignment */
  display: flex;
  flex-direction: column;
}

.schema-field:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

/* ===== Compact Mode Styles ===== */
.schema-field.compact-mode {
  margin-bottom: 0.125rem;
  padding-bottom: 0.125rem;
}

.schema-field.compact-mode .field-header {
  margin-bottom: 0.125rem;
}

.schema-field.compact-mode .field-header label {
  margin-bottom: 0.125rem;
  font-size: 0.875rem;
}

.schema-field.compact-mode .validation-error {
  padding: 4px 6px;
  margin-top: 0.125rem;
  font-size: 0.75rem;
}

.schema-field.compact-mode .object-container {
  margin-left: 0.5rem;
  margin-top: 0.25rem;
}

.schema-field.compact-mode .array-container {
  margin-top: 0.25rem;
}

.field-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1; /* Fill remaining space */
}

.field-input-wrapper.field-modified {
  border-left: 3px solid #ffc107;
  padding-left: 8px;
  border-radius: 3px;
}

.field-input-wrapper .q-field,
.field-input-wrapper .q-toggle {
  flex: 1;
}

.object-container {
  position: relative;
}

.object-fields-container {
  display: grid;
  gap: 8px;
  width: 100%;
}

.object-fields-container.columns-1 {
  grid-template-columns: 1fr;
}

.object-fields-container.columns-2 {
  grid-template-columns: repeat(2, 1fr);
}

.object-fields-container.columns-3 {
  grid-template-columns: repeat(3, 1fr);
}

.object-field-item {
  margin-bottom: 0.5rem;
}

/* Responsive adjustments for object fields */
@media (max-width: 768px) {
  .object-fields-container.columns-2,
  .object-fields-container.columns-3 {
    grid-template-columns: 1fr;
  }
}

.array-container {
  position: relative;
}

.field-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.125rem;
}

.field-header label {
  margin-bottom: 0.125rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.field-description {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: normal;
  margin-top: 0.0625rem;
  line-height: 1.2;
}

.validation-error {
  display: flex;
  align-items: center;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 4px 6px;
  margin-top: 0.125rem;
  font-size: 0.875rem;
}

/* Mobile responsiveness */
@media (max-width: 599px) {
  .schema-field {
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
  }

  .field-input-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .field-input-wrapper .q-field,
  .field-input-wrapper .q-toggle {
    width: 100%;
  }
}
</style>

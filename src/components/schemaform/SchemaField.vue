<template>
  <div class="schema-field" :class="{ 'compact-mode': compact }">
    <QForm @submit="handleSubmit">
      <!-- Field Label and Description -->
      <div class="field-header">
        <label class="text-base font-medium q-mb-sm block">
          {{ fieldDisplayName }}
          <span v-if="resolvedSchema.required" class="text-red-500"> *</span>
          <span
            v-if="resolvedSchema.description && !compact"
            class="field-description"
          >
            {{ resolvedSchema.description }}
          </span>
        </label>
      </div>

      <!-- Validation Error Message -->
      <div v-if="validationError" class="validation-error q-mb-sm">
        <QIcon name="error" color="red" size="sm" />
        <span class="text-red-600 text-sm q-ml-xs">{{ validationError }}</span>
      </div>

      <!-- Input Field with Modification Indicator -->
      <div
        class="field-input-wrapper"
        :class="{ 'field-modified': isThisFieldModified }"
      >
        <!-- String Input -->
        <QInput
          v-if="isStringInput"
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
          :model-value="numberValue"
          type="number"
          :min="resolvedSchema.minimum"
          :max="resolvedSchema.maximum"
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
            v-for="(prop, key) in resolvedSchema.properties"
            :key="key"
            class="q-mb-md"
          >
            <SchemaField
              :schema="prop"
              :root-schema="props.rootSchema"
              :model-value="getNestedValue(key)"
              :is-modified="isNestedFieldModified(key)"
              :parent-key="key"
              :check-nested-modification="props.checkNestedModification"
              :compact="compact"
              :field-key="key"
              @update:model-value="handleNestedValueUpdate(key, $event)"
              @validation-error="handleNestedValidationError"
              @validation-success="handleNestedValidationSuccess"
            />
          </div>
        </div>
      </div>

      <!-- Array Input -->
      <div v-if="isArrayType" class="array-container">
        <QInput
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
    </QForm>
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

const props = withDefaults(defineProps<SchemaFieldProps>(), {
  rootSchema: null,
  isModified: false,
  parentKey: "",
  checkNestedModification: () => false,
  compact: false,
  fieldKey: "",
});

const emit = defineEmits<SchemaFieldEmits>();

// Internal state
const internalValue = ref<FieldValue>(props.modelValue);
const arrayStringValue = ref("");
const validationError = ref("");

// Computed properties
const resolvedSchema = computed((): AppSchema => {
  // Resolve $ref references
  if (props.schema && props.rootSchema) {
    if (props.schema.$ref) {
      const refPath = props.schema.$ref;
      if (refPath.startsWith("#/$defs/")) {
        const defName = refPath.substring(8);
        const resolved = props.rootSchema.$defs?.[defName];
        if (resolved) {
          return { ...resolved, ...props.schema };
        }
      }
    }
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
  return resolvedSchema.value.title || props.fieldKey || "Field";
});

const inputPlaceholder = computed((): string => {
  return resolvedSchema.value.description || "Enter value";
});

// Value conversions for different input types
const stringValue = computed((): string => {
  return String(internalValue.value || "");
});

const numberValue = computed((): number => {
  return Number(internalValue.value || 0);
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

const getSchemaType = (): string => {
  const type = resolvedSchema.value.type;
  if (Array.isArray(type)) {
    return type[0] || "string";
  }
  return type || "string";
};

// Validation rules
const validationRules = computed((): ValidationRule[] => {
  const rules: ValidationRule[] = [];
  const schema = resolvedSchema.value;

  if (schema.required) {
    rules.push(
      (val: any): boolean | string =>
        (val !== null && val !== undefined && val !== "") ||
        "This field is required"
    );
  }

  if (schema.type === "string") {
    if (schema.minLength !== undefined) {
      rules.push(
        (val: any): boolean | string =>
          !val ||
          (typeof val === "string" && val.length >= schema.minLength!) ||
          `Minimum length is ${schema.minLength}`
      );
    }
    if (schema.maxLength !== undefined) {
      rules.push(
        (val: any): boolean | string =>
          !val ||
          (typeof val === "string" && val.length <= schema.maxLength!) ||
          `Maximum length is ${schema.maxLength}`
      );
    }
  }

  if (schema.type === "integer" || schema.type === "number") {
    if (schema.minimum !== undefined) {
      rules.push(
        (val: any): boolean | string =>
          val === null ||
          val === undefined ||
          (typeof val === "number" && val >= schema.minimum!) ||
          `Minimum value is ${schema.minimum}`
      );
    }
    if (schema.maximum !== undefined) {
      rules.push(
        (val: any): boolean | string =>
          val === null ||
          val === undefined ||
          (typeof val === "number" && val <= schema.maximum!) ||
          `Maximum value is ${schema.maximum}`
      );
    }
  }

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
  const value = internalValue.value;
  const schema = resolvedSchema.value;

  validationError.value = "";

  if (
    schema.required &&
    (value === null || value === undefined || value === "")
  ) {
    validationError.value = "This field is required";
    emit("validation-error", validationError.value);
    return false;
  }

  if (value === null || value === undefined || value === "") {
    emit("validation-success");
    return true;
  }

  if (schema.type === "string" && typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      validationError.value = `Minimum length is ${schema.minLength}`;
      emit("validation-error", validationError.value);
      return false;
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      validationError.value = `Maximum length is ${schema.maxLength}`;
      emit("validation-error", validationError.value);
      return false;
    }
  }

  if (schema.type === "integer" || schema.type === "number") {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      validationError.value = "Must be a valid number";
      emit("validation-error", validationError.value);
      return false;
    }
    if (schema.minimum !== undefined && numValue < schema.minimum) {
      validationError.value = `Minimum value is ${schema.minimum}`;
      emit("validation-error", validationError.value);
      return false;
    }
    if (schema.maximum !== undefined && numValue > schema.maximum) {
      validationError.value = `Maximum value is ${schema.maximum}`;
      emit("validation-error", validationError.value);
      return false;
    }
  }

  emit("validation-success");
  return true;
};

// Value change handlers
const handleValueChange = (value: FieldValue): void => {
  const schemaType = getSchemaType();
  const processedValue = convertValueToSchemaType(value, schemaType);

  internalValue.value = processedValue;
  if (validateField()) {
    emit("update:model-value", processedValue);
  }
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

const handleSubmit = (): void => {
  validateField();
};
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

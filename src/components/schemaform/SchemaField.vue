<template>
  <div class="schema-field">
    <q-form @submit="handleSubmit">
      <!-- Field Label and Description -->
      <div class="field-header">
        <label class="text-base font-medium q-mb-sm block">
          {{ fieldDisplayName }}
          <span v-if="resolvedSchema.required" class="text-red-500"> *</span>
        </label>
      </div>

      <p
        v-if="resolvedSchema.description"
        class="text-sm text-gray-500 q-mb-sm"
      >
        {{ resolvedSchema.description }}
      </p>

      <!-- Validation Error Message -->
      <div v-if="validationError" class="validation-error q-mb-sm">
        <q-icon name="error" color="red" size="sm" />
        <span class="text-red-600 text-sm q-ml-xs">{{ validationError }}</span>
      </div>

      <!-- Input Field with Modification Indicator -->
      <div
        class="field-input-wrapper"
        :class="{ 'field-modified': isThisFieldModified }"
      >
        <!-- String Input -->
        <q-input
          v-if="isStringInput"
          :model-value="stringValue"
          :placeholder="inputPlaceholder"
          :disabled="resolvedSchema.readOnly"
          :rules="validationRules"
          @update:model-value="handleValueChange"
          @blur="validateField"
        />

        <!-- Select Input -->
        <q-select
          v-else-if="isSelectInput"
          :model-value="stringValue"
          :options="resolvedSchema.enum || []"
          :label="fieldDisplayName"
          :disabled="resolvedSchema.readOnly"
          :rules="validationRules"
          @update:model-value="handleValueChange"
          @blur="validateField"
        />

        <!-- Number Input -->
        <q-input
          v-else-if="isNumberInput"
          :model-value="numberValue"
          type="number"
          :min="resolvedSchema.minimum"
          :max="resolvedSchema.maximum"
          :placeholder="inputPlaceholder"
          :disabled="resolvedSchema.readOnly"
          :rules="validationRules"
          @update:model-value="handleValueChange"
          @blur="validateField"
        />

        <!-- Boolean Input -->
        <q-toggle
          v-else-if="isBooleanInput"
          :model-value="booleanValue"
          :label="fieldDisplayName"
          :disabled="resolvedSchema.readOnly"
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
            <schema-field
              :schema="prop"
              :root-schema="props.rootSchema"
              :model-value="getNestedValue(key)"
              :is-modified="isNestedFieldModified(key)"
              :parent-key="key"
              :check-nested-modification="props.checkNestedModification"
              @update:model-value="handleNestedValueUpdate(key, $event)"
              @validation-error="handleNestedValidationError"
              @validation-success="handleNestedValidationSuccess"
            />
          </div>
        </div>
      </div>

      <!-- Array Input -->
      <div v-if="isArrayType" class="array-container">
        <q-input
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
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import type { AppSchema } from "../../types/schema";

// Type definitions for better type safety
type FieldValue =
  | string
  | number
  | boolean
  | unknown[]
  | Record<string, any>
  | null
  | undefined;
type ValidationRule = (val: any) => boolean | string;

interface SchemaFieldProps {
  schema: AppSchema;
  modelValue: FieldValue;
  rootSchema: AppSchema | null;
  isModified: boolean;
  parentKey: string;
  checkNestedModification: (parentKey: string, childKey: string) => boolean;
}

const props = withDefaults(defineProps<SchemaFieldProps>(), {
  rootSchema: null,
  isModified: false,
  parentKey: "",
  checkNestedModification: () => false,
});

const emit = defineEmits<{
  "update:model-value": [value: FieldValue];
  "validation-error": [error: string];
  "validation-success": [];
}>();

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
  return resolvedSchema.value.type === "integer";
});

const isBooleanInput = computed((): boolean => {
  return resolvedSchema.value.type === "boolean";
});

const isThisFieldModified = computed((): boolean => {
  return props.isModified;
});

const fieldDisplayName = computed((): string => {
  return resolvedSchema.value.title || "Field";
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
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  transition: all 0.2s ease;
}

.schema-field:last-child {
  border-bottom: none;
}

.field-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-input-wrapper.field-modified {
  border-left: 4px solid #ffc107;
  padding-left: 12px;
  border-radius: 4px;
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
  align-items: center;
  justify-content: space-between;
}

.validation-error {
  display: flex;
  align-items: center;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 8px 12px;
}
</style>

<template>
  <div class="config-field" :class="{ 'field-modified': isThisFieldModified }">
    <q-form @submit="onSubmit">
      <!-- Field Label and Description -->
      <div class="field-header">
        <label class="text-base font-medium q-mb-sm block">
          {{ resolvedSchema.title || fieldName }}
          <span v-if="resolvedSchema.required" class="text-red-500"> *</span>
          <q-icon
            v-if="isThisFieldModified"
            name="edit"
            size="sm"
            color="orange"
            class="q-ml-xs"
          >
            <q-tooltip>This field has been modified</q-tooltip>
          </q-icon>
        </label>
      </div>

      <p
        v-if="resolvedSchema.description"
        class="text-sm text-gray-500 q-mb-sm"
      >
        {{ resolvedSchema.description }}
        <template
          v-if="
            resolvedSchema.minimum !== undefined ||
            resolvedSchema.maximum !== undefined
          "
        >
          <br />
          <span>
            {{
              resolvedSchema.minimum !== undefined &&
              resolvedSchema.maximum !== undefined
                ? `Range: ${resolvedSchema.minimum} - ${resolvedSchema.maximum}`
                : resolvedSchema.minimum !== undefined
                ? `Minimum: ${resolvedSchema.minimum}`
                : `Maximum: ${resolvedSchema.maximum}`
            }}
          </span>
        </template>
      </p>

      <!-- Validation Error Message -->
      <div v-if="validationError" class="validation-error q-mb-sm">
        <q-icon name="error" color="red" size="sm" />
        <span class="text-red-600 text-sm q-ml-xs">{{ validationError }}</span>
      </div>

      <!-- Advanced Options Section -->
      <div v-if="showAdvanced && hasAdvancedInfo" class="advanced-info q-mb-md">
        <q-card class="bg-grey-1">
          <q-card-section class="q-pa-sm">
            <div class="text-caption text-weight-medium q-mb-xs">
              Advanced Information:
            </div>

            <!-- Type Information -->
            <div class="text-caption q-mb-xs">
              <strong>Type:</strong> {{ resolvedSchema.type }}
              <span v-if="resolvedSchema.format">
                ({{ resolvedSchema.format }})</span
              >
            </div>

            <!-- Default Value -->
            <div
              v-if="resolvedSchema.default !== undefined"
              class="text-caption q-mb-xs"
            >
              <strong>Default:</strong>
              <code>{{ JSON.stringify(resolvedSchema.default) }}</code>
            </div>

            <!-- Examples -->
            <div
              v-if="
                resolvedSchema.examples && resolvedSchema.examples.length > 0
              "
              class="text-caption q-mb-xs"
            >
              <strong>Examples:</strong>
              <div
                v-for="(example, index) in resolvedSchema.examples"
                :key="index"
                class="q-ml-sm"
              >
                <code>{{ JSON.stringify(example) }}</code>
              </div>
            </div>

            <!-- Enum Values -->
            <div v-if="resolvedSchema.enum" class="text-caption q-mb-xs">
              <strong>Allowed Values:</strong>
              <div class="q-ml-sm">
                <q-chip
                  v-for="value in resolvedSchema.enum"
                  :key="value"
                  size="sm"
                  color="blue-1"
                  text-color="blue-9"
                  class="q-mr-xs q-mb-xs"
                >
                  {{ value }}
                </q-chip>
              </div>
            </div>

            <!-- Validation Rules -->
            <div v-if="hasValidationRules" class="text-caption">
              <strong>Validation Rules:</strong>
              <ul class="q-mt-xs q-mb-none">
                <li v-if="resolvedSchema.minimum !== undefined">
                  Minimum: {{ resolvedSchema.minimum }}
                </li>
                <li v-if="resolvedSchema.maximum !== undefined">
                  Maximum: {{ resolvedSchema.maximum }}
                </li>
                <li v-if="resolvedSchema.minLength !== undefined">
                  Min Length: {{ resolvedSchema.minLength }}
                </li>
                <li v-if="resolvedSchema.maxLength !== undefined">
                  Max Length: {{ resolvedSchema.maxLength }}
                </li>
                <li v-if="resolvedSchema.pattern">
                  Pattern: <code>{{ resolvedSchema.pattern }}</code>
                </li>
              </ul>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Input Fields Based on Type -->
      <q-input
        v-if="resolvedSchema.type === 'string' && !resolvedSchema.enum"
        v-model="internalValue"
        :placeholder="
          resolvedSchema.description ||
          'Enter ' + (resolvedSchema.title || 'value')
        "
        :disabled="resolvedSchema.readOnly"
        :rules="validationRules"
        @update:model-value="onValueChange"
        @blur="validateField"
      />

      <q-select
        v-if="resolvedSchema.type === 'string' && resolvedSchema.enum"
        v-model="internalValue"
        :options="resolvedSchema.enum"
        :label="resolvedSchema.title || 'Select option'"
        :disabled="resolvedSchema.readOnly"
        :rules="validationRules"
        @update:model-value="onValueChange"
        @blur="validateField"
      />

      <q-input
        v-if="resolvedSchema.type === 'integer'"
        v-model.number="internalValue"
        type="number"
        :min="resolvedSchema.minimum"
        :max="resolvedSchema.maximum"
        :placeholder="resolvedSchema.description || 'Enter number'"
        :disabled="resolvedSchema.readOnly"
        :rules="validationRules"
        @update:model-value="onValueChange"
        @blur="validateField"
      />

      <q-toggle
        v-if="resolvedSchema.type === 'boolean'"
        v-model="internalValue"
        :label="resolvedSchema.title || 'Toggle option'"
        :disabled="resolvedSchema.readOnly"
        @update:model-value="onValueChange"
      />

      <!-- Object Input -->
      <div v-if="isObjectType">
        <!-- Nested Object Properties -->
        <div v-if="resolvedSchema.properties" class="q-ml-md q-mt-sm">
          <div
            v-for="(prop, key) in resolvedSchema.properties"
            :key="key"
            class="q-mb-md"
          >
            <config-field
              :schema="prop"
              :root-schema="props.rootSchema"
              :model-value="getNestedValue(key)"
              :show-advanced="showAdvanced"
              :is-modified="isNestedFieldModified(key)"
              :check-nested-modification="props.checkNestedModification"
              @update:model-value="updateNestedValue(key, $event)"
            />
          </div>
        </div>

        <!-- Fallback JSON Input for objects without properties -->
        <div v-else>
          <q-input
            type="textarea"
            v-model="objectStringValue"
            :placeholder="resolvedSchema.description || 'Enter JSON object'"
            :rows="5"
            :disabled="resolvedSchema.readOnly"
            :rules="validationRules"
            @update:model-value="updateObjectValue"
            @blur="validateField"
          />
          <div class="text-caption text-grey-6 q-mt-xs">
            Enter a valid JSON object
          </div>
        </div>
      </div>

      <!-- Array Input -->
      <div v-if="isArrayType">
        <q-input
          type="textarea"
          v-model="arrayStringValue"
          :placeholder="resolvedSchema.description || 'Enter JSON array'"
          :rows="5"
          :disabled="resolvedSchema.readOnly"
          :rules="validationRules"
          @update:model-value="updateArrayValue"
          @blur="validateField"
        />
        <div class="text-caption text-grey-6 q-mt-xs">
          Enter a valid JSON array
        </div>
      </div>

      <!-- Default Input for unknown types -->
      <q-input
        v-if="!isKnownType"
        v-model="internalValue"
        :placeholder="resolvedSchema.description || 'Enter value'"
        :disabled="resolvedSchema.readOnly"
        :rules="validationRules"
        @update:model-value="onValueChange"
        @blur="validateField"
      />
    </q-form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  schema: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: [String, Number, Boolean, Array, Object],
    required: true,
  },
  rootSchema: {
    type: Object,
    default: null,
  },
  showAdvanced: {
    type: Boolean,
    default: false,
  },
  isModified: {
    type: Boolean,
    default: false,
  },
  parentKey: {
    type: String,
    default: "",
  },
  checkNestedModification: {
    type: Function,
    default: () => false,
  },
});

const emit = defineEmits(["update:model-value"]);

// Internal value for two-way binding
const internalValue = ref(props.modelValue);

// String representations for objects and arrays
const objectStringValue = ref("");
const arrayStringValue = ref("");

// Validation state
const validationError = ref("");

// Function to resolve $ref references
const resolveSchemaRef = (schema, rootSchema) => {
  if (!schema || !rootSchema) return schema;

  if (schema.$ref) {
    const refPath = schema.$ref;
    if (refPath.startsWith("#/$defs/")) {
      const defName = refPath.substring(8); // Remove '#/$defs/'
      const resolved = rootSchema.$defs?.[defName];
      if (resolved) {
        // Merge the resolved schema with the original schema (keeping title, description, etc.)
        return { ...resolved, ...schema };
      }
    }
  }

  return schema;
};

// Computed property for resolved schema
const resolvedSchema = computed(() => {
  return resolveSchemaRef(props.schema, props.rootSchema);
});

// Check if field has advanced information to show
const hasAdvancedInfo = computed(() => {
  const schema = resolvedSchema.value;
  return (
    schema.format ||
    schema.examples ||
    schema.enum ||
    schema.minimum !== undefined ||
    schema.maximum !== undefined ||
    schema.minLength !== undefined ||
    schema.maxLength !== undefined ||
    schema.pattern ||
    schema.default !== undefined
  );
});

// Check if field has validation rules
const hasValidationRules = computed(() => {
  const schema = resolvedSchema.value;
  return (
    schema.minimum !== undefined ||
    schema.maximum !== undefined ||
    schema.minLength !== undefined ||
    schema.maxLength !== undefined ||
    schema.pattern
  );
});

// Validation rules for Quasar inputs
const validationRules = computed(() => {
  const rules = [];
  const schema = resolvedSchema.value;

  // Required field validation
  if (schema.required) {
    rules.push(
      (val) =>
        (val !== null && val !== undefined && val !== "") ||
        "This field is required"
    );
  }

  // String validation
  if (schema.type === "string") {
    if (schema.minLength !== undefined) {
      rules.push(
        (val) =>
          !val ||
          val.length >= schema.minLength ||
          `Minimum length is ${schema.minLength}`
      );
    }
    if (schema.maxLength !== undefined) {
      rules.push(
        (val) =>
          !val ||
          val.length <= schema.maxLength ||
          `Maximum length is ${schema.maxLength}`
      );
    }
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      rules.push(
        (val) =>
          !val || regex.test(val) || `Must match pattern: ${schema.pattern}`
      );
    }
    if (schema.enum) {
      rules.push(
        (val) =>
          !val ||
          schema.enum.includes(val) ||
          `Must be one of: ${schema.enum.join(", ")}`
      );
    }
  }

  // Number validation
  if (schema.type === "integer" || schema.type === "number") {
    if (schema.minimum !== undefined) {
      rules.push(
        (val) =>
          val === null ||
          val === undefined ||
          val >= schema.minimum ||
          `Minimum value is ${schema.minimum}`
      );
    }
    if (schema.maximum !== undefined) {
      rules.push(
        (val) =>
          val === null ||
          val === undefined ||
          val <= schema.maximum ||
          `Maximum value is ${schema.maximum}`
      );
    }
  }

  return rules;
});

// Computed properties for type checking
const isObjectType = computed(() => {
  const value =
    props.modelValue !== undefined
      ? props.modelValue
      : resolvedSchema.value.default;
  return (
    resolvedSchema.value.type === "object" ||
    (typeof value === "object" && value !== null && !Array.isArray(value))
  );
});

const isArrayType = computed(() => {
  const value =
    props.modelValue !== undefined
      ? props.modelValue
      : resolvedSchema.value.default;
  return resolvedSchema.value.type === "array" || Array.isArray(value);
});

const isKnownType = computed(() => {
  return (
    resolvedSchema.value.type === "string" ||
    resolvedSchema.value.type === "integer" ||
    resolvedSchema.value.type === "boolean" ||
    isObjectType.value ||
    isArrayType.value
  );
});

// Sync internal value with prop
watch(
  () => props.modelValue,
  (newValue) => {
    // Use default value if modelValue is undefined
    const value =
      newValue !== undefined ? newValue : resolvedSchema.value.default;
    internalValue.value = value;

    // Update string representations
    if (isObjectType.value) {
      try {
        objectStringValue.value = JSON.stringify(value, null, 2);
      } catch (error) {
        objectStringValue.value = String(value);
      }
    } else if (isArrayType.value) {
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
const validateField = () => {
  const value = internalValue.value;
  const schema = resolvedSchema.value;

  // Clear previous error
  validationError.value = "";

  // Required validation
  if (
    schema.required &&
    (value === null || value === undefined || value === "")
  ) {
    validationError.value = "This field is required";
    return false;
  }

  // Skip validation if value is empty and not required
  if (value === null || value === undefined || value === "") {
    return true;
  }

  // String validation
  if (schema.type === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      validationError.value = `Minimum length is ${schema.minLength}`;
      return false;
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      validationError.value = `Maximum length is ${schema.maxLength}`;
      return false;
    }
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        validationError.value = `Must match pattern: ${schema.pattern}`;
        return false;
      }
    }
    if (schema.enum && !schema.enum.includes(value)) {
      validationError.value = `Must be one of: ${schema.enum.join(", ")}`;
      return false;
    }
  }

  // Number validation
  if (schema.type === "integer" || schema.type === "number") {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      validationError.value = "Must be a valid number";
      return false;
    }
    if (schema.minimum !== undefined && numValue < schema.minimum) {
      validationError.value = `Minimum value is ${schema.minimum}`;
      return false;
    }
    if (schema.maximum !== undefined && numValue > schema.maximum) {
      validationError.value = `Maximum value is ${schema.maximum}`;
      return false;
    }
  }

  return true;
};

// Value change handler
const onValueChange = (value) => {
  internalValue.value = value;

  // Validate the new value
  if (validateField()) {
    emit("update:model-value", value);
  }
};

// Helper for object handling
const updateObjectValue = (value) => {
  try {
    const parsed = JSON.parse(value);
    if (validateField()) {
      emit("update:model-value", parsed);
    }
  } catch (error) {
    validationError.value = "Invalid JSON object";
  }
};

const updateArrayValue = (value) => {
  try {
    const parsed = JSON.parse(value);
    if (validateField()) {
      emit("update:model-value", parsed);
    }
  } catch (error) {
    validationError.value = "Invalid JSON array";
  }
};

// Helper functions for nested object handling
const getNestedValue = (key) => {
  if (!props.modelValue || typeof props.modelValue !== "object") {
    return undefined;
  }
  return props.modelValue[key];
};

const updateNestedValue = (key, value) => {
  const currentValue = props.modelValue || {};
  const updatedValue = { ...currentValue, [key]: value };
  emit("update:model-value", updatedValue);
};

// Check if nested field is modified
const isNestedFieldModified = (key) => {
  // For nested fields, we need to check if this specific field is modified
  // Since we don't have access to the parent's checkNestedModification function,
  // we'll use a different approach
  if (props.parentKey && props.checkNestedModification) {
    return props.checkNestedModification(props.parentKey, key);
  }
  // Fallback: check if the parent object itself is modified
  return props.isModified;
};

// Check if this field itself is modified (for display purposes)
const isThisFieldModified = computed(() => {
  return props.isModified;
});

// Form submit handler
const onSubmit = () => {
  validateField();
};

// Generate field name from schema
const fieldName = computed(() => {
  return resolvedSchema.value.title
    ? resolvedSchema.value.title
    : resolvedSchema.value.$id?.split("/").pop() || "Field";
});
</script>

<style>
.config-field {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  transition: all 0.2s ease;
}

.config-field:last-child {
  border-bottom: none;
}

.field-modified {
  border-left: 4px solid #ffc107 !important;
  padding-left: 12px !important;
  border-radius: 4px !important;
  background-color: #fff3cd !important;
}

.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.advanced-info {
  border-left: 3px solid #007bff;
  padding-left: 12px;
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

<template>
  <div class="schema-form">
    <!-- Form Header -->
    <div v-if="showHeader" class="form-header q-mb-md">
      <q-card>
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold">{{ title || "Form" }}</h2>
              <p v-if="description" class="text-gray-600">{{ description }}</p>
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                v-if="showResetButton"
                icon="refresh"
                color="secondary"
                label="Reset"
                :loading="isResetting"
                @click="handleReset"
              />
              <q-btn
                v-if="showSaveButton"
                icon="save"
                color="primary"
                label="Save"
                :disabled="!canSave"
                :loading="isSaving"
                @click="handleSave"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <q-skeleton type="text" height="30px" class="q-mb-md" />
      <q-skeleton type="rect" height="300px" />
    </div>

    <!-- Form Content -->
    <div v-else-if="schema" class="form-content">
      <!-- Schema Information -->
      <q-card
        v-if="showSchemaInfo && (schema.title || schema.description)"
        class="bg-blue-1 q-mb-md"
      >
        <q-card-section class="q-pa-sm">
          <div v-if="schema.title" class="text-weight-medium">
            {{ schema.title }}
          </div>
          <div v-if="schema.description" class="text-caption">
            {{ schema.description }}
          </div>
        </q-card-section>
      </q-card>

      <!-- Form Fields -->
      <div class="form-fields q-gutter-md">
        <div v-for="key in schemaPropertyKeys" :key="key" class="q-mb-md">
          <schema-field
            :schema="resolveSchemaRef(schema!.properties![key], schema)"
            :root-schema="schema"
            :model-value="formData[key]"
            :is-modified="showModifiedIndicators ? isFieldModified(key) : false"
            :parent-key="key"
            :check-nested-modification="
              showModifiedIndicators ? isSpecificFieldModified : () => false
            "
            @update:model-value="handleFormDataUpdate(key, $event)"
            @validation-error="handleValidationError(key, $event)"
            @validation-success="handleValidationSuccess(key)"
          />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <q-card class="bg-red-1">
        <q-card-section>
          <div class="text-red-600">
            <q-icon name="error" size="sm" />
            <span class="q-ml-sm">{{ error }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuasar } from "quasar";
import SchemaField from "./SchemaField.vue";
import type { AppSchema } from "../../types/schema";

// Type definitions for better type safety
type FormData = Record<string, any>;
type ValidationErrors = Map<string, string>;

interface SchemaFormProps {
  // Schema and data
  schema: AppSchema | null;
  initialData: FormData;
  originalData?: FormData; // Add optional originalData prop

  // UI configuration
  title: string;
  description: string;
  showHeader: boolean;
  showSchemaInfo: boolean;

  // Button configuration
  showResetButton: boolean;
  showSaveButton: boolean;

  // State
  loading: boolean;
  error: string;

  // External validation
  externalValidationErrors: ValidationErrors;

  // Feature flags
  showModifiedIndicators: boolean;
}

const props = withDefaults(defineProps<SchemaFormProps>(), {
  schema: null,
  initialData: () => ({}),
  originalData: undefined,
  title: "",
  description: "",
  showHeader: true,
  showSchemaInfo: true,
  showResetButton: true,
  showSaveButton: true,
  loading: false,
  error: "",
  externalValidationErrors: () => new Map<string, string>(),
  showModifiedIndicators: true,
});

const emit = defineEmits<{
  "update:model-value": [value: FormData];
  save: [value: FormData];
  reset: [value: FormData];
  "validation-error": [key: string, error: string];
  "validation-success": [key: string];
}>();

const $q = useQuasar();

// Internal state
const formData = ref<FormData>({});
const originalData = ref<FormData>({});
const validationErrors = ref<ValidationErrors>(new Map());

// Loading states
const isResetting = ref<boolean>(false);
const isSaving = ref<boolean>(false);

// Computed properties
const schemaPropertyKeys = computed((): string[] => {
  return Object.keys(props.schema?.properties || {});
});

const hasChanges = computed((): boolean => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value);
});

const hasValidationErrors = computed((): boolean => {
  return validationErrors.value.size > 0;
});

const canSave = computed((): boolean => {
  return hasChanges.value && !hasValidationErrors.value;
});

// Helper function to resolve $ref references
const resolveSchemaRef = (
  schema: AppSchema,
  rootSchema: AppSchema | null
): AppSchema => {
  if (!schema || !rootSchema) return schema;

  if (schema.$ref) {
    const refPath = schema.$ref;
    if (refPath.startsWith("#/$defs/")) {
      const defName = refPath.substring(8);
      const resolved = rootSchema.$defs?.[defName];
      if (resolved) {
        return { ...resolved, ...schema };
      }
    }
  }

  return schema;
};

// Utility functions
const showNotification = (
  type: "positive" | "negative",
  message: string
): void => {
  $q.notify({
    type,
    message,
    position: "top",
  });
};

const showErrorNotification = (message: string): void => {
  showNotification("negative", message);
};

const showSuccessNotification = (message: string): void => {
  showNotification("positive", message);
};

// Watch for prop changes
watch(
  () => props.initialData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      formData.value = { ...newData };
      // Only set originalData if it's empty (first load) or if explicitly reset
      if (Object.keys(originalData.value).length === 0) {
        originalData.value = JSON.parse(JSON.stringify(newData));
      }
    }
  },
  { immediate: true, deep: true }
);

// Watch for external originalData updates
watch(
  () => props.originalData,
  (newOriginalData) => {
    if (newOriginalData && Object.keys(newOriginalData).length > 0) {
      originalData.value = JSON.parse(JSON.stringify(newOriginalData));
    }
  },
  { deep: true }
);

watch(
  () => props.externalValidationErrors,
  (newErrors) => {
    // Merge external validation errors
    const mergedErrors = new Map<string, string>();
    validationErrors.value.forEach((value, key) =>
      mergedErrors.set(key, value)
    );
    newErrors.forEach((value, key) => mergedErrors.set(key, value));
    validationErrors.value = mergedErrors;
  },
  { deep: true }
);

// Methods
const handleFormDataUpdate = (key: string, value: any): void => {
  // Create a new object to avoid reference issues
  formData.value = { ...formData.value, [key]: value };
  emit("update:model-value", formData.value);
};

const handleValidationError = (key: string, error: string): void => {
  validationErrors.value.set(key, error);
  emit("validation-error", key, error);
};

const handleValidationSuccess = (key: string): void => {
  validationErrors.value.delete(key);
  emit("validation-success", key);
};

const isFieldModified = (fieldPath: string): boolean => {
  const currentValue = formData.value[fieldPath];
  const originalValue = originalData.value[fieldPath];

  // For object types, we need to check if any nested properties have changed
  if (
    typeof currentValue === "object" &&
    currentValue !== null &&
    !Array.isArray(currentValue) &&
    typeof originalValue === "object" &&
    originalValue !== null &&
    !Array.isArray(originalValue)
  ) {
    // Check if any nested properties have changed
    const currentKeys = Object.keys(currentValue);
    const originalKeys = Object.keys(originalValue);

    // If keys are different, it's modified
    if (currentKeys.length !== originalKeys.length) {
      return true;
    }

    // Check each key
    for (const key of currentKeys) {
      if (
        JSON.stringify(currentValue[key]) !== JSON.stringify(originalValue[key])
      ) {
        return true;
      }
    }

    return false;
  }

  return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
};

// Check if a specific nested field is modified
const isSpecificFieldModified = (
  parentKey: string,
  childKey: string
): boolean => {
  const currentParent = formData.value[parentKey] || {};
  const originalParent = originalData.value[parentKey] || {};
  const currentValue = currentParent[childKey];
  const originalValue = originalParent[childKey];
  return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
};

const handleReset = (): void => {
  $q.dialog({
    title: "Reset Form",
    message:
      "Are you sure you want to reset all fields to their original values?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      isResetting.value = true;
      formData.value = JSON.parse(JSON.stringify(originalData.value));
      validationErrors.value.clear();
      emit("reset", formData.value);
      emit("update:model-value", formData.value);
      showSuccessNotification("Form reset successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showErrorNotification(`Failed to reset form: ${message}`);
    } finally {
      isResetting.value = false;
    }
  });
};

const handleSave = (): void => {
  if (hasValidationErrors.value) {
    showErrorNotification("Please fix validation errors before saving");
    return;
  }

  $q.dialog({
    title: "Save Form",
    message: "Are you sure you want to save the current form data?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      isSaving.value = true;
      emit("save", formData.value);
      showSuccessNotification("Form saved successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      showErrorNotification(`Failed to save form: ${message}`);
    } finally {
      isSaving.value = false;
    }
  });
};

// Expose methods for parent components
defineExpose({
  getFormData: (): FormData => formData.value,
  setFormData: (data: FormData): void => {
    formData.value = { ...data };
    originalData.value = JSON.parse(JSON.stringify(data));
  },
  resetForm: handleReset,
  saveForm: handleSave,
  hasChanges,
  hasValidationErrors,
});
</script>

<style scoped>
.schema-form {
  width: 100%;
}

.form-header {
  margin-bottom: 1rem;
}

.loading-container,
.error-container {
  padding: 1rem;
}

.form-content {
  width: 100%;
}

.form-fields {
  width: 100%;
}
</style>

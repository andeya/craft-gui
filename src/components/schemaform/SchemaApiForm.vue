<template>
  <div class="schema-api-form">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <QCard class="loading-card">
        <QCardSection class="text-center q-pa-lg">
          <QSpinner color="primary" size="2em" />
          <div class="text-body1 q-mt-md">Loading schema...</div>
        </QCardSection>
      </QCard>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <QCard class="error-card">
        <QCardSection class="q-pa-md">
          <div class="row items-center q-col-gutter-sm">
            <QIcon name="error" color="negative" size="1.5em" />
            <div class="col">
              <div class="text-h6 text-negative">Schema Load Error</div>
              <div class="text-body2">{{ error }}</div>
            </div>
          </div>
        </QCardSection>
      </QCard>
    </div>

    <!-- Form Content -->
    <div v-else-if="schema" class="form-content">
      <!-- Form Header -->
      <div v-if="showHeader" class="form-header q-mb-md">
        <QCard class="form-header-card">
          <QCardSection class="q-pa-md">
            <div class="row items-center justify-between">
              <div class="col-grow">
                <h3 class="text-lg font-semibold q-mb-xs">
                  {{ schema.title || "API Form" }}
                </h3>
                <p
                  v-if="schema.description"
                  class="text-caption text-grey-6 q-mb-none"
                >
                  {{ schema.description }}
                </p>
              </div>
              <div class="col-auto">
                <!-- Compact Mode Toggle -->
                <QToggle
                  v-model="compactMode"
                  icon="compress"
                  color="primary"
                  size="sm"
                >
                  <QTooltip>Toggle compact mode</QTooltip>
                </QToggle>
              </div>
            </div>
          </QCardSection>
        </QCard>
      </div>

      <!-- Form Fields -->
      <QForm @submit="handleSubmit" class="form-fields">
        <QCard class="form-fields-card">
          <QCardSection class="q-pa-md">
            <div class="fields-container" :class="`columns-${columns}`">
              <!-- Render form fields based on schema properties -->
              <template v-if="schema.properties">
                <SchemaField
                  v-for="(prop, key) in schema.properties"
                  :key="key"
                  :schema="prop"
                  :root-schema="schema"
                  :model-value="formData[key]"
                  :is-modified="isFieldModified(key)"
                  :parent-key="key"
                  :check-nested-modification="isNestedFieldModified"
                  :compact="compactMode"
                  :field-key="key"
                  @update:model-value="handleFieldUpdate(key, $event)"
                  @validation-error="handleValidationError"
                  @validation-success="handleValidationSuccess"
                />
              </template>

              <!-- No properties message -->
              <div v-else class="col-12">
                <div class="text-center q-pa-lg">
                  <QIcon name="info" color="grey-6" size="2em" />
                  <div class="text-body1 q-mt-md text-grey-6">
                    No form fields defined in schema
                  </div>
                </div>
              </div>
            </div>
          </QCardSection>

          <!-- Form Actions -->
          <QCardActions class="q-pa-md q-pt-none">
            <div class="row full-width justify-end q-col-gutter-sm">
              <!-- Cancel Button -->
              <QBtn
                v-if="showCancelButton"
                :label="cancelButtonText"
                :icon="cancelButtonIcon"
                color="grey-6"
                flat
                :loading="submitting"
                :disabled="disabled"
                @click="handleCancel"
              />

              <!-- Submit Button -->
              <QBtn
                v-if="showSubmitButton"
                :label="submitButtonText"
                :icon="submitButtonIcon"
                color="primary"
                :loading="submitting"
                :disabled="!canSubmit || disabled"
                @click="handleSubmit"
              />
            </div>
          </QCardActions>
        </QCard>
      </QForm>

      <!-- Validation Errors Summary -->
      <div v-if="validationErrors.size > 0" class="validation-summary q-mt-md">
        <QCard class="validation-card">
          <QCardSection class="q-pa-md">
            <div class="row items-center q-col-gutter-sm">
              <QIcon name="warning" color="warning" size="1.5em" />
              <div class="col">
                <div class="text-h6 text-warning">Validation Errors</div>
                <div class="text-body2">
                  Please fix the following errors before submitting:
                </div>
                <ul class="q-mt-sm q-mb-none">
                  <li
                    v-for="(error, field) in validationErrors"
                    :key="field"
                    class="text-body2"
                  >
                    <strong>{{ field }}:</strong> {{ error }}
                  </li>
                </ul>
              </div>
            </div>
          </QCardSection>
        </QCard>
      </div>
    </div>

    <!-- No Schema State -->
    <div v-else class="no-schema-container">
      <QCard class="no-schema-card">
        <QCardSection class="text-center q-pa-lg">
          <QIcon name="schema" color="grey-6" size="3em" />
          <div class="text-h6 q-mt-md text-grey-6">No Schema Available</div>
          <div class="text-body2 text-grey-6">
            Please provide a valid schema id
          </div>
        </QCardSection>
      </QCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useQuasar } from "quasar";
import { invoke } from "@tauri-apps/api/core";
import SchemaField from "./SchemaField.vue";
import type { AppSchema } from "../../types/schema";
import { TAURI_COMMANDS } from "../../utils/tauri-commands";

// Type definitions
type FormData = Record<string, any>;
type ValidationErrors = Map<string, string>;

interface SchemaApiFormProps {
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

  // Button configuration
  showSubmitButton?: boolean;
  showCancelButton?: boolean;
  submitButtonText?: string;
  submitButtonIcon?: string;
  cancelButtonText?: string;
  cancelButtonIcon?: string;

  // Form styling
  labelWidth?: string;
  labelPosition?: "left" | "top" | "right";
  size?: "small" | "medium" | "large";
}

interface SchemaApiFormEmits {
  // Standard form events
  (e: "update:model-value", data: FormData): void;
  (e: "submit", data: FormData): void;
  (e: "cancel"): void;

  // Validation events
  (e: "validation-error", errors: ValidationErrors): void;
  (e: "validation-success"): void;

  // Schema events
  (e: "schema-loaded", schema: AppSchema): void;
  (e: "schema-error", error: string): void;
}

const props = withDefaults(defineProps<SchemaApiFormProps>(), {
  modelValue: () => ({}),
  initialData: () => ({}),
  disabled: false,
  loading: false,
  readonly: false,
  columns: 0, // 0=auto, 1=single column, 2=double column, 3=triple column
  compact: false,
  showHeader: true,
  showSubmitButton: true,
  showCancelButton: true,
  submitButtonText: "Submit",
  submitButtonIcon: "send",
  cancelButtonText: "Cancel",
  cancelButtonIcon: "close",
  labelWidth: "120px",
  labelPosition: "left",
  size: "medium",
});

const emit = defineEmits<SchemaApiFormEmits>();

// Quasar instance
const $q = useQuasar();

// Reactive state
const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const schema = ref<AppSchema | null>(null);
const formData = ref<FormData>({});
const originalData = ref<FormData>({});
const validationErrors = ref<ValidationErrors>(new Map());
const compactMode = ref(props.compact);

// Computed properties
const canSubmit = computed((): boolean => {
  return (
    !loading.value && !submitting.value && validationErrors.value.size === 0
  );
});

// Helper function to get invoke command
const getInvokeCommand = (command: string): string => {
  switch (command) {
    case "get_schema":
      return TAURI_COMMANDS.APPDATA.GET_SCHEMA;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};

// Methods
const loadSchema = async (): Promise<void> => {
  if (!props.schemaId) {
    error.value = "Schema id is required";
    emit("schema-error", error.value);
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const command = getInvokeCommand("get_schema");
    console.log(`[SchemaApiForm] Loading schema: ${props.schemaId}`);
    const schemaData = await invoke(command, {
      schemaId: props.schemaId,
    });

    console.log(`[SchemaApiForm] Schema loaded:`, schemaData);
    schema.value = schemaData as AppSchema;

    // Initialize form data with schema defaults
    initializeFormData();

    emit("schema-loaded", schema.value);
  } catch (err) {
    error.value = `Failed to load schema: ${err}`;
    console.error("[SchemaApiForm] Schema load error:", err);
    emit("schema-error", error.value);
  } finally {
    loading.value = false;
  }
};

const initializeFormData = (): void => {
  if (!schema.value?.properties) {
    formData.value = { ...props.initialData };
    originalData.value = JSON.parse(JSON.stringify(formData.value));
    return;
  }

  const defaultData: FormData = {};

  // Set default values from schema
  Object.entries(schema.value.properties).forEach(([key, prop]) => {
    if (prop.default !== undefined) {
      defaultData[key] = prop.default;
    }
  });

  // Merge with initial data (initial data takes precedence)
  formData.value = { ...defaultData, ...props.initialData };
  originalData.value = JSON.parse(JSON.stringify(formData.value));
};

const isFieldModified = (fieldPath: string): boolean => {
  const currentValue = formData.value[fieldPath];
  const originalValue = originalData.value[fieldPath];

  if (
    typeof currentValue === "object" &&
    currentValue !== null &&
    !Array.isArray(currentValue)
  ) {
    return false;
  }

  return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
};

const isNestedFieldModified = (
  parentKey: string,
  childKey: string
): boolean => {
  const currentParent = formData.value[parentKey] || {};
  const originalParent = originalData.value[parentKey] || {};
  const currentValue = currentParent[childKey];
  const originalValue = originalParent[childKey];
  return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
};

const handleFieldUpdate = (key: string, value: any): void => {
  formData.value[key] = value;
};

const handleValidationError = (_error: string): void => {
  // This will be handled by individual SchemaField components
  // The validation errors are collected in the validationErrors Map
};

const handleValidationSuccess = (): void => {
  // This will be handled by individual SchemaField components
};

const validateForm = (): boolean => {
  validationErrors.value.clear();

  if (!schema.value?.properties) {
    return true;
  }

  let isValid = true;

  Object.entries(schema.value.properties).forEach(([key, prop]) => {
    const value = formData.value[key];

    // Required field validation
    if (
      prop.required &&
      (value === null || value === undefined || value === "")
    ) {
      validationErrors.value.set(key, "This field is required");
      isValid = false;
      return;
    }

    // Skip validation for empty optional fields
    if (value === null || value === undefined || value === "") {
      return;
    }

    // Type-specific validation
    if (prop.type === "string" && typeof value === "string") {
      if (prop.minLength !== undefined && value.length < prop.minLength) {
        validationErrors.value.set(key, `Minimum length is ${prop.minLength}`);
        isValid = false;
      }
      if (prop.maxLength !== undefined && value.length > prop.maxLength) {
        validationErrors.value.set(key, `Maximum length is ${prop.maxLength}`);
        isValid = false;
      }
    }

    if (
      (prop.type === "integer" || prop.type === "number") &&
      typeof value === "number"
    ) {
      if (prop.minimum !== undefined && value < prop.minimum) {
        validationErrors.value.set(key, `Minimum value is ${prop.minimum}`);
        isValid = false;
      }
      if (prop.maximum !== undefined && value > prop.maximum) {
        validationErrors.value.set(key, `Maximum value is ${prop.maximum}`);
        isValid = false;
      }
    }
  });

  if (!isValid) {
    emit("validation-error", validationErrors.value);
  } else {
    emit("validation-success");
  }

  return isValid;
};

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return;
  }

  submitting.value = true;

  try {
    console.log("[SchemaApiForm] Submitting form data:", formData.value);

    // Emit submit event for parent component to handle
    emit("submit", formData.value);

    // Show success notification
    $q.notify({
      type: "positive",
      message: "Form submitted successfully",
      position: "top",
      timeout: 3000,
    });
  } catch (err) {
    const errorMessage = `Submit failed: ${err}`;
    console.error("[SchemaApiForm] Submit error:", err);

    // Show error notification
    $q.notify({
      type: "negative",
      message: errorMessage,
      position: "top",
      timeout: 5000,
    });
  } finally {
    submitting.value = false;
  }
};

const handleCancel = (): void => {
  emit("cancel");
};

// Watchers
watch(
  () => props.schemaId,
  () => {
    if (props.schemaId) {
      loadSchema();
    }
  }
);

watch(
  () => props.initialData,
  () => {
    if (schema.value) {
      initializeFormData();
    }
  },
  { deep: true }
);

watch(
  () => props.compact,
  (newValue) => {
    compactMode.value = newValue;
  }
);

// Lifecycle
onMounted(() => {
  if (props.schemaId) {
    loadSchema();
  }
});

// Expose methods for parent components
defineExpose({
  getFormData: () => formData.value,
  setFormData: (data: FormData) => {
    formData.value = { ...data };
    originalData.value = JSON.parse(JSON.stringify(data));
  },
  validate: validateForm,
  submit: handleSubmit,
  reset: () => {
    formData.value = { ...originalData.value };
    validationErrors.value.clear();
  },
  loadSchema,
});
</script>

<style scoped>
.schema-api-form {
  width: 100%;
}

.loading-container,
.error-container,
.no-schema-container {
  padding: 1rem;
}

.loading-card,
.error-card,
.no-schema-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 1rem;
}

.form-header-card {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-content {
  width: 100%;
}

.form-fields {
  width: 100%;
}

.form-fields-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.validation-summary {
  margin-top: 1rem;
}

.validation-card {
  border-radius: 8px;
  border-left: 4px solid #ff9800;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.validation-card ul {
  list-style-type: none;
  padding-left: 0;
}

.validation-card li {
  padding: 0.25rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.validation-card li:last-child {
  border-bottom: none;
}

/* Fields container layout */
.fields-container {
  display: grid;
  gap: 8px;
  width: 100%;
}

.fields-container.columns-0 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.fields-container.columns-1 {
  grid-template-columns: 1fr;
}

.fields-container.columns-2 {
  grid-template-columns: repeat(2, 1fr);
}

.fields-container.columns-3 {
  grid-template-columns: repeat(3, 1fr);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .fields-container.columns-0,
  .fields-container.columns-2,
  .fields-container.columns-3 {
    grid-template-columns: 1fr;
  }
}

/* Mobile responsiveness */
@media (max-width: 599px) {
  .form-header .row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-header .col-auto {
    margin-top: 0.5rem;
    align-self: flex-end;
  }

  .form-fields-card .q-card__actions .row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-fields-card .q-card__actions .q-btn {
    margin-bottom: 0.5rem;
  }

  .form-fields-card .q-card__actions .q-btn:last-child {
    margin-bottom: 0;
  }
}
</style>

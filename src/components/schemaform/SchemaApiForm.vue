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
          <div class="row items-start q-col-gutter-sm">
            <QIcon name="error" color="negative" size="1.5em" class="q-mt-xs" />
            <div class="col">
              <div class="text-h6 text-negative">Schema Load Error</div>
              <div class="text-body2 error-message">{{ error }}</div>
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
              <!-- Render form fields based on schema traversal -->
              <template v-if="schema">
                <SchemaField
                  v-for="fieldInfo in schemaFieldInfos"
                  :key="fieldInfo.key"
                  :schema="fieldInfo.schema"
                  :root-schema="schema"
                  :model-value="fieldInfo.value"
                  :is-modified="
                    props.showModificationIndicator
                      ? isFieldModified(fieldInfo.key)
                      : false
                  "
                  :parent-key="fieldInfo.key"
                  :check-nested-modification="
                    props.showModificationIndicator
                      ? isNestedFieldModified
                      : () => false
                  "
                  :compact="compactMode"
                  :field-key="fieldInfo.key"
                  @update:model-value="handleFieldUpdate(fieldInfo.key, $event)"
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
            <div class="row items-start q-col-gutter-sm">
              <QIcon
                name="warning"
                color="warning"
                size="1.5em"
                class="q-mt-xs"
              />
              <div class="col">
                <div class="text-h6 text-warning">Validation Errors</div>
                <div class="text-body2">
                  Please fix the following errors before submitting:
                </div>
                <div class="validation-errors-list q-mt-sm">
                  <ul class="q-mb-none">
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
import type {
  FormData,
  ValidationErrors,
  SchemaApiFormProps,
  SchemaApiFormEmits,
} from "./types";
import {
  initializeSchemaData,
  validateSchemaData,
  resolveSchemaRef,
} from "../../utils/schema-utils";

// Constants
const MAX_DEPTH = 10;
const NOTIFICATION_TIMEOUT = {
  SUCCESS: 3000,
  ERROR: 5000,
};

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
  showSuccessNotification: true,
  maxHeight: "70vh", // Maximum height for the form container
  showModificationIndicator: false, // Show modification indicators
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

// Generate field infos using schema traversal
const schemaFieldInfos = computed(() => {
  if (!schema.value) return [];

  const fieldInfos: Array<{
    key: string;
    schema: AppSchema;
    value: any;
  }> = [];

  // For form fields, we need to traverse the schema properties directly
  if (schema.value.properties) {
    Object.entries(schema.value.properties).forEach(([key, propSchema]) => {
      // Resolve $ref references for the property schema
      const resolvedSchema = resolveSchemaRef(propSchema, schema.value!);

      fieldInfos.push({
        key,
        schema: resolvedSchema,
        value: formData.value[key],
      });
    });
  }

  return fieldInfos;
});

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

    console.log(`[SchemaApiForm] Schema loaded:`);
    console.log(JSON.stringify(schemaData, null, 2));

    schema.value = schemaData as AppSchema;
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

  // If we have initial data, use it directly
  if (Object.keys(props.initialData).length > 0) {
    formData.value = { ...props.initialData };
    originalData.value = JSON.parse(JSON.stringify(formData.value));
    return;
  }

  // Only initialize with schema defaults when there's no initial data
  const defaultData = initializeSchemaData(
    schema.value,
    schema.value,
    MAX_DEPTH
  );

  formData.value = { ...defaultData };
  originalData.value = JSON.parse(JSON.stringify(formData.value));
};

const isFieldModified = (fieldPath: string): boolean => {
  const currentValue = formData.value[fieldPath];
  const originalValue = originalData.value[fieldPath];

  // Skip object comparison for nested objects (handled by isNestedFieldModified)
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

const showNotification = (
  type: "positive" | "negative",
  message: string
): void => {
  $q.notify({
    type,
    message,
    position: "top",
    timeout:
      type === "positive"
        ? NOTIFICATION_TIMEOUT.SUCCESS
        : NOTIFICATION_TIMEOUT.ERROR,
    html: true,
    classes: "smart-notification",
  });
};

const handleValidationError = (_error: string): void => {
  // Handled by individual SchemaField components
};

const handleValidationSuccess = (): void => {
  // Handled by individual SchemaField components
};

const validateForm = (): boolean => {
  validationErrors.value.clear();

  if (!schema.value?.properties) {
    return true;
  }

  const validationResult = validateSchemaData(
    formData.value,
    schema.value,
    schema.value,
    MAX_DEPTH
  );

  if (!validationResult.valid) {
    // Convert errors array to Map for compatibility
    validationResult.errors.forEach((error) => {
      const match = error.match(/Field '([^']+)'/);
      const fieldName = match ? match[1] : "unknown";
      validationErrors.value.set(fieldName, error);
    });

    emit("validation-error", validationErrors.value);
    return false;
  }

  emit("validation-success");
  return true;
};

const handleSubmit = async (): Promise<void> => {
  if (!validateForm()) {
    return;
  }

  submitting.value = true;

  try {
    console.log(
      "[SchemaApiForm] Submitting form data:",
      JSON.stringify(formData.value, null, 2)
    );

    // Emit submit event with callback for result
    emit("submit", formData.value, (success: boolean, message?: string) => {
      if (success && props.showSuccessNotification) {
        showNotification("positive", message || "Form submitted successfully");
      } else if (!success && message) {
        showNotification("negative", message);
      }
      submitting.value = false;
    });
  } catch (err) {
    const errorMessage = `Submit failed: ${err}`;
    console.error("[SchemaApiForm] Submit error:", err);
    showNotification("negative", errorMessage);
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

.error-message {
  max-height: 150px;
  overflow-y: auto;
  word-break: break-word;
  scrollbar-width: thin;
  scrollbar-color: rgba(244, 67, 54, 0.3) transparent;
}

.error-message::-webkit-scrollbar {
  width: 4px;
}

.error-message::-webkit-scrollbar-track {
  background: transparent;
}

.error-message::-webkit-scrollbar-thumb {
  background-color: rgba(244, 67, 54, 0.3);
  border-radius: 2px;
}

.error-message::-webkit-scrollbar-thumb:hover {
  background-color: rgba(244, 67, 54, 0.5);
}

/* Smart notification styles - universal for all notification types */
:global(.smart-notification) {
  max-width: 90vw !important;
  word-break: break-word !important;
  white-space: normal !important;
}

:global(.smart-notification .q-notification__message) {
  max-height: 200px !important;
  overflow-y: auto !important;
  word-break: break-word !important;
  white-space: normal !important;
  line-height: 1.4 !important;
  padding: 8px 0 !important;
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
  max-height: v-bind("props.maxHeight");
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

.form-content::-webkit-scrollbar {
  width: 6px;
}

.form-content::-webkit-scrollbar-track {
  background: transparent;
}

.form-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.form-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.form-fields {
  width: 100%;
}

.form-fields-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  max-height: 60vh;
  overflow-y: auto;
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

.validation-errors-list {
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 152, 0, 0.3) transparent;
}

.validation-errors-list::-webkit-scrollbar {
  width: 4px;
}

.validation-errors-list::-webkit-scrollbar-track {
  background: transparent;
}

.validation-errors-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 152, 0, 0.3);
  border-radius: 2px;
}

.validation-errors-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 152, 0, 0.5);
}

/* Fields container layout */
.fields-container {
  display: grid;
  gap: 8px;
  width: 100%;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.fields-container::-webkit-scrollbar {
  width: 4px;
}

.fields-container::-webkit-scrollbar-track {
  background: transparent;
}

.fields-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.fields-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.4);
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

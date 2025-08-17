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
      <QForm ref="formRef" class="form-fields" @submit="handleSubmit">
        <QCard class="form-fields-card">
          <QCardSection class="q-pa-md">
            <div
              class="fields-container"
              :class="`columns-${getRootColumnsLocal()}`"
            >
              <!-- Render form fields based on schema traversal -->
              <template v-if="schema">
                <div
                  v-for="fieldInfo in schemaFieldInfos"
                  :key="fieldInfo.key"
                  :class="[
                    `field-span-${getFieldSpanLocal(fieldInfo)}`,
                    fieldInfo.schema.type === 'object' &&
                    fieldInfo.schema.properties
                      ? 'field-object'
                      : 'field-simple',
                  ]"
                >
                  <SchemaField
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
                    :field-path="fieldInfo.fieldPath"
                    :columns="getFieldColumnsLocal(fieldInfo)"
                    @update:model-value="
                      handleFieldUpdate(fieldInfo.key, $event)
                    "
                    @validation-error="handleValidationError"
                    @validation-success="handleValidationSuccess"
                    :ref="
                      (el) => {
                        if (el) fieldRefs[fieldInfo.key] = el as any;
                      }
                    "
                  />
                </div>
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
              <!-- Clear Button -->
              <QBtn
                v-if="showClearButton"
                :label="clearButtonText"
                :icon="clearButtonIcon"
                color="grey-6"
                flat
                :loading="submitting"
                :disabled="disabled"
                @click="handleClear"
              />

              <!-- Reset Button -->
              <QBtn
                v-if="showResetButton"
                :label="resetButtonText"
                :icon="resetButtonIcon"
                color="orange"
                flat
                :loading="submitting"
                :disabled="disabled"
                @click="handleReset"
              />

              <!-- Submit Button -->
              <QBtn
                v-if="showSubmitButton"
                :label="submitButtonText"
                :icon="submitButtonIcon"
                color="primary"
                :loading="submitting"
                :disabled="!canSubmit || disabled"
                type="submit"
              />
            </div>
          </QCardActions>
        </QCard>
      </QForm>
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
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import { createDebugLogger } from "../../utils/debug";
import { CleanupManager } from "../../utils/cleanup";
import { invoke } from "@tauri-apps/api/core";
import SchemaField from "./SchemaField.vue";
import type { AppSchema } from "../../types/schema";

import { TAURI_COMMANDS } from "../../utils/tauri-commands";
import type {
  FormData,
  SchemaApiFormProps,
  SchemaApiFormEmits,
  // FieldLayoutConfig,
} from "./types";
import {
  initializeSchemaData,
  resolveSchemaRef,
} from "../../utils/schema-utils";
import {
  getFieldLayout,
  // getRootLayout,
  // getFieldColumns,
  // getFieldSpan,
  getRootColumns,
  getFieldLayoutWithRef,
} from "./layout-utils";
import { fieldPathResolver } from "./ref-path-resolver";

// Component reference types
interface FormRef {
  validate: () => boolean | Promise<boolean>;
  resetValidation: () => void;
  setTouched: (touched: boolean) => void;
}

interface FieldRef {
  validate: () => boolean | string;
  setTouched: (touched: boolean) => void;
  clearValidation: () => void;
  triggerValidation: () => { valid: boolean; error?: string };
}

type FieldRefs = Record<string, FieldRef>;

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
  showResetButton: false,
  showClearButton: false,
  submitButtonText: "Submit",
  submitButtonIcon: "send",
  resetButtonText: "Reset",
  resetButtonIcon: "refresh",
  clearButtonText: "Clear",
  clearButtonIcon: "clear_all",
  labelWidth: "120px",
  labelPosition: "left",
  size: "medium",
  showSuccessNotification: true,
  maxHeight: "70vh", // Maximum height for the form container
  showModificationIndicator: false, // Show modification indicators
  fieldLayoutConfig: () => [], // Field layout configuration
});

const emit = defineEmits<SchemaApiFormEmits>();

// Quasar instance
const $q = useQuasar();
const debug = createDebugLogger("SchemaApiForm");
const cleanup = new CleanupManager();

// Reactive state
const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const schema = ref<AppSchema | null>(null);
const formData = ref<FormData>({});
const originalData = ref<FormData>({});

const compactMode = ref(props.compact);
const fieldRefs = ref<FieldRefs>({}); // Store field component references
const formRef = ref<FormRef | null>(null); // Form reference for validation

// Computed properties
const canSubmit = computed((): boolean => {
  return !loading.value && !submitting.value;
});

// Generate field infos using schema traversal with path resolution
const schemaFieldInfos = computed(() => {
  if (!schema.value) return [];

  const fieldInfos: Array<{
    key: string;
    schema: AppSchema;
    value: any;
    fieldPath: string;
    isRefField: boolean;
    refPath?: string;
  }> = [];

  // For form fields, we need to traverse the schema properties directly
  if (schema.value.properties) {
    Object.entries(schema.value.properties).forEach(([key, propSchema]) => {
      // Resolve $ref references for the property schema
      const resolvedSchema = resolveSchemaRef(propSchema, schema.value!);

      // Resolve field path with $ref context
      const resolvedInfo = fieldPathResolver.resolveFieldPath(
        key,
        "",
        propSchema,
        schema.value!
      );

      // Ensure we get the current value from formData
      const currentValue = formData.value[key];

      fieldInfos.push({
        key,
        schema: resolvedSchema,
        value: currentValue,
        fieldPath: resolvedInfo.fieldPath,
        isRefField: resolvedInfo.isRefField,
        refPath: resolvedInfo.refPath,
      });
    });
  }

  return fieldInfos;
});

// Layout utility functions using shared implementation with $ref support
const getFieldLayoutLocal = (fieldInfo: any) => {
  if (fieldInfo.isRefField && fieldInfo.refPath) {
    // Use $ref-aware layout resolution
    const resolvedInfo = {
      fieldPath: fieldInfo.fieldPath,
      parentPath: fieldInfo.key,
      fieldName: fieldInfo.key,
      isRefField: fieldInfo.isRefField,
      refPath: fieldInfo.refPath,
      schema: fieldInfo.schema,
    };
    return getFieldLayoutWithRef(resolvedInfo, props.fieldLayoutConfig);
  } else {
    // Use standard path-based resolution
    return getFieldLayout(fieldInfo.fieldPath, props.fieldLayoutConfig);
  }
};

// const getRootLayoutLocal = () => getRootLayout(props.fieldLayoutConfig);

const getFieldColumnsLocal = (fieldInfo: any) => {
  const layout = getFieldLayoutLocal(fieldInfo);
  return layout?.columns ?? props.columns;
};

const getFieldSpanLocal = (fieldInfo: any) => {
  const layout = getFieldLayoutLocal(fieldInfo);
  return layout?.span ?? 1;
};

const getRootColumnsLocal = () =>
  getRootColumns(props.fieldLayoutConfig, props.columns);

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

    const schemaData = await invoke(command, {
      schemaId: props.schemaId,
    });

    schema.value = schemaData as AppSchema;

    // Format and output schema JSON
    debug.log(`Schema loaded for: ${props.schemaId}`);
    debug.log("Schema data:\n" + JSON.stringify(schemaData, null, 2));

    initializeFormData();
    emit("schema-loaded", schema.value);
  } catch (err) {
    error.value = `Failed to load schema: ${err}`;
    debug.error("Schema load error", err);
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

  // Get schema defaults to ensure all fields are present
  const defaultData = initializeSchemaData(
    schema.value,
    schema.value,
    MAX_DEPTH
  );

  // Always start with schema defaults to ensure all fields are present
  formData.value = { ...defaultData };

  // If we have initial data, merge it with defaults (initialData takes precedence)
  if (Object.keys(props.initialData).length > 0) {
    formData.value = { ...formData.value, ...props.initialData };
  }

  // Store the complete initial state
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
  if (!schema.value?.properties) {
    return true;
  }

  // Quasar form submission will automatically trigger validation for all fields
  // We just need to check if any validation errors exist
  let allValid = true;

  // Get all field refs and trigger validation
  Object.values(fieldRefs.value).forEach((fieldRef: any) => {
    if (fieldRef && typeof fieldRef.triggerValidation === "function") {
      const result = fieldRef.triggerValidation();
      if (!result.valid) {
        allValid = false;
      }
    }
  });

  return allValid;
};

const handleSubmit = async (evt?: Event): Promise<void> => {
  // Prevent default form submission
  if (evt) {
    evt.preventDefault();
  }

  // Manually validate the form
  if (formRef.value && typeof formRef.value.validate === "function") {
    const isValid = await formRef.value.validate();
    if (!isValid) {
      return; // Validation failed, don't proceed
    }
  }

  // Set submitting state
  submitting.value = true;

  try {
    // Set a timeout to reset submitting state if callback is not called
    cleanup.addTimeout(
      "submit-timeout",
      () => {
        debug.warn(
          "Submit callback not called within timeout, resetting submitting state"
        );
        submitting.value = false;
      },
      10000
    ); // 10 second timeout

    // Emit submit event with callback for result
    emit("submit", formData.value, (success: boolean, message?: string) => {
      cleanup.remove("submit-timeout"); // Clear the timeout
      if (success) {
        // Update original data when submit is successful
        updateOriginalData();
        if (props.showSuccessNotification) {
          showNotification(
            "positive",
            message || "Form submitted successfully"
          );
        }
      } else if (message) {
        showNotification("negative", message);
      }
      submitting.value = false;
    });
  } catch (err) {
    const errorMessage = `Submit failed: ${err}`;
    debug.error("Submit error", err);
    showNotification("negative", errorMessage);
    submitting.value = false;
  }
};

const handleClear = (): void => {
  if (props.showClearConfirmation) {
    $q.dialog({
      title: "Clear Form",
      message: "Are you sure you want to clear all form data?",
      cancel: true,
      persistent: true,
    }).onOk(() => {
      formData.value = {};
      emit("clear");
    });
  } else {
    formData.value = {};
    emit("clear");
  }
};

const handleReset = (): void => {
  if (props.showResetConfirmation) {
    $q.dialog({
      title: "Reset Form",
      message: "Are you sure you want to reset the form to its initial state?",
      cancel: true,
      persistent: true,
    }).onOk(() => {
      resetFormData();
    });
  } else {
    resetFormData();
  }
};

const resetFormData = (): void => {
  // Reset form data to original state
  // Use deep clone to ensure all nested objects are properly reset
  formData.value = JSON.parse(JSON.stringify(originalData.value));

  // Clear form validation state
  if (formRef.value && typeof formRef.value.resetValidation === "function") {
    formRef.value.resetValidation();
  }

  // Clear validation state for all field components
  Object.values(fieldRefs.value).forEach((fieldRef: any) => {
    if (fieldRef && typeof fieldRef.clearValidation === "function") {
      fieldRef.clearValidation();
    }
  });

  emit("reset", originalData.value);
};

// Update original data when form is successfully submitted or when user confirms changes
const updateOriginalData = (): void => {
  originalData.value = JSON.parse(JSON.stringify(formData.value));
};

// Cleanup on component unmount
onUnmounted(() => {
  cleanup.cleanup();
});

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
  reset: resetFormData,
  updateOriginalData,
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
  max-height: v-bind("props.maxHeight");
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
  max-height: v-bind("props.maxHeight");
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

/* Field span classes for layout control */
.field-span-1 {
  grid-column: span 1;
}
.field-span-2 {
  grid-column: span 2;
}
.field-span-3 {
  grid-column: span 3;
}

.field-object {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  background-color: #fafafa;
}

.field-simple {
  padding: 4px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .fields-container.columns-0,
  .fields-container.columns-2,
  .fields-container.columns-3 {
    grid-template-columns: 1fr;
  }

  .field-span-1,
  .field-span-2,
  .field-span-3 {
    grid-column: span 1;
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

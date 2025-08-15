<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Configuration Form Panel -->
      <div class="col-12">
        <q-card class="full-height">
          <q-card-section>
            <!-- Header with Actions -->
            <div class="row items-center justify-between q-mb-md">
              <h2 class="text-xl font-semibold">Configuration</h2>
              <div class="row q-gutter-sm">
                <q-btn
                  icon="edit"
                  :color="showModifiedIndicators ? 'warning' : 'grey'"
                  size="sm"
                  @click="toggleModifiedIndicators"
                >
                  <q-tooltip>
                    Toggle modified field indicators (show/hide yellow
                    highlighting for changed fields)
                  </q-tooltip>
                </q-btn>
                <q-btn
                  icon="refresh"
                  color="secondary"
                  label="Reset"
                  :loading="isResetting"
                  @click="handleReset"
                />
                <q-btn
                  icon="save"
                  color="primary"
                  label="Save Configuration"
                  :disabled="!canSave"
                  :loading="isSaving"
                  @click="handleSave"
                />
              </div>
            </div>

            <!-- Configuration Form -->
            <div v-if="schema" class="settings-form-container">
              <schema-form
                :schema="schema"
                :initial-data="formData"
                :original-data="originalData"
                title=""
                description=""
                :show-header="false"
                :show-schema-info="false"
                :show-reset-button="false"
                :show-save-button="false"
                :loading="isLoading"
                :error="errorMessage"
                :external-validation-errors="validationErrors"
                :show-modified-indicators="showModifiedIndicators"
                @update:model-value="handleFormDataUpdate"
                @validation-error="handleValidationError"
                @validation-success="handleValidationSuccess"
              />
            </div>

            <!-- Loading State -->
            <div v-else-if="isLoading" class="loading-container">
              <q-skeleton type="text" height="30px" class="q-mb-md" />
              <q-skeleton type="rect" height="300px" />
            </div>

            <!-- Error State -->
            <div v-else-if="errorMessage" class="error-container">
              <q-card class="bg-red-1">
                <q-card-section>
                  <div class="text-red-600">
                    <q-icon name="error" size="sm" />
                    <span class="q-ml-sm">{{ errorMessage }}</span>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h } from "vue";
import { useQuasar } from "quasar";
import { invoke } from "@tauri-apps/api/core";
import { stringify } from "smol-toml";
import SchemaForm from "../schemaform/SchemaForm.vue";
import TextDiffDialog from "../TextDiffDialog.vue";
import type { AppSchema } from "../../types/schema";

// Type definitions for better type safety
type ConfigData = Record<string, any>;
type ValidationErrors = Map<string, string>;

// Constants
const DIALOG_STYLES = {
  minWidth: "60vw",
  maxWidth: "85vw",
} as const;

const NOTIFICATION_POSITION = "top" as const;

// State management
const schema = ref<AppSchema | null>(null);
const formData = ref<ConfigData>({});
const originalData = ref<ConfigData>({});
const showModifiedIndicators = ref<boolean>(true);
const validationErrors = ref<ValidationErrors>(new Map());
const errorMessage = ref<string>("");

// Loading states
const isLoading = ref<boolean>(false);
const isSaving = ref<boolean>(false);
const isResetting = ref<boolean>(false);

// Quasar instance
const $q = useQuasar();

// Computed properties
const hasChanges = computed((): boolean => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value);
});

const hasValidationErrors = computed((): boolean => {
  return validationErrors.value.size > 0;
});

const canSave = computed((): boolean => {
  return hasChanges.value && !hasValidationErrors.value;
});

// Utility functions
const showNotification = (
  type: "positive" | "negative" | "custom",
  message: string,
  color?: string
): void => {
  $q.notify({
    type,
    message,
    position: NOTIFICATION_POSITION,
    color,
  });
};

const showErrorNotification = (message: string): void => {
  showNotification("negative", message);
};

const showSuccessNotification = (message: string, color?: string): void => {
  if (color) {
    showNotification("custom", message, color);
  } else {
    showNotification("positive", message);
  }
};

const handleError = (error: unknown, context: string): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`${context} error:`, error);
  return `${context}: ${errorMessage}`;
};

// Data loading methods
const loadSchema = async (): Promise<void> => {
  try {
    isLoading.value = true;
    const schemaData = (await invoke("cfg_cmd_get_schema")) as AppSchema;
    schema.value = schemaData;
  } catch (error) {
    const message = handleError(error, "Failed to load schema");
    errorMessage.value = message;
    showErrorNotification(message);
  } finally {
    isLoading.value = false;
  }
};

const loadData = async (): Promise<void> => {
  try {
    isLoading.value = true;
    const data = (await invoke("cfg_cmd_get_data")) as ConfigData;
    formData.value = { ...data };
    originalData.value = JSON.parse(JSON.stringify(data));
    errorMessage.value = ""; // Clear any previous errors
  } catch (error) {
    const message = handleError(error, "Failed to load configuration");
    errorMessage.value = message;
    showErrorNotification(message);
  } finally {
    isLoading.value = false;
  }
};

// Form data management
const handleFormDataUpdate = (newData: ConfigData): void => {
  formData.value = { ...newData };
};

// Validation handling
const handleValidationError = (key: string, error: string): void => {
  validationErrors.value.set(key, error);
};

const handleValidationSuccess = (key: string): void => {
  validationErrors.value.delete(key);
};

// UI interaction methods
const toggleModifiedIndicators = (): void => {
  showModifiedIndicators.value = !showModifiedIndicators.value;
};

// Configuration actions
const handleReset = (): void => {
  $q.dialog({
    title: "Reset Configuration",
    message:
      "Are you sure you want to reset all settings to their original values?",
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      isResetting.value = true;
      await loadData();
      showSuccessNotification("Configuration reset successfully", "secondary");
    } catch (error) {
      const message = handleError(error, "Failed to reset configuration");
      showErrorNotification(message);
    } finally {
      isResetting.value = false;
    }
  });
};

const handleSave = (): void => {
  $q.dialog({
    title: "Save Configuration",
    component: h(TextDiffDialog, {
      currentText: stringify(formData.value),
      originalText: stringify(originalData.value),
      subtitle:
        "Review the differences between current and original configuration",
      confirmButtonLabel: "Save",
      cancelButtonLabel: "Cancel",
      confirmButtonColor: "primary",
      cancelButtonColor: "secondary",
    }),
    cancel: true,
    persistent: true,
    style: `min-width: ${DIALOG_STYLES.minWidth}; max-width: ${DIALOG_STYLES.maxWidth};`,
  }).onOk(async () => {
    try {
      isSaving.value = true;
      await invoke("cfg_cmd_save_data", { config: formData.value });
      // Update original data to reflect the saved state and force reactivity
      const updatedData = JSON.parse(JSON.stringify(formData.value));
      originalData.value = updatedData;
      formData.value = updatedData;
      showSuccessNotification("Configuration saved successfully");
    } catch (error) {
      const message = handleError(error, "Failed to save configuration");
      showErrorNotification(message);
    } finally {
      isSaving.value = false;
    }
  });
};

// Lifecycle
onMounted(async () => {
  await Promise.all([loadSchema(), loadData()]);
});
</script>

<style scoped>
.settings-form-container {
  max-height: 70vh;
  overflow-y: auto;
}

.loading-container,
.error-container {
  padding: 1rem;
}

/* Dialog content styling */
:deep(.q-dialog__inner--minimized > div) {
  max-width: 90vw !important;
}
</style>

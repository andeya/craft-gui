<template>
  <div class="appdata-form">
    <!-- Form Header with Schema Selection -->
    <div v-if="showHeader" class="form-header q-mb-sm">
      <QCard class="compact-header">
        <QCardSection class="q-pa-sm">
          <div class="row items-center justify-between q-col-gutter-sm">
            <div class="col-grow">
              <h3 class="text-lg font-semibold q-mb-xs">
                {{ schema?.title || title || "SchemaDataForm Form" }}
              </h3>
              <p
                v-if="schema?.description || description"
                class="text-caption text-grey-6 q-mb-none"
              >
                {{ schema?.description || description }}
              </p>
            </div>
            <div class="col-auto">
              <div class="row q-col-gutter-sm">
                <!-- Compact Mode Toggle -->
                <QToggle
                  v-if="compactConfig.show"
                  v-model="compactMode"
                  icon="compress"
                  color="primary"
                  size="sm"
                  class="compact-toggle"
                >
                  <QTooltip>{{ UI_MESSAGES.TOOLTIPS.COMPACT_MODE }}</QTooltip>
                </QToggle>

                <!-- Schema Selection -->
                <QSelect
                  v-if="availableSchemas.length > 1"
                  v-model="selectedSchema"
                  :options="availableSchemas"
                  option-label="name"
                  option-value="name"
                  label="Schema"
                  dense
                  outlined
                  class="compact-select"
                  @update:model-value="onSchemaChange"
                />

                <!-- Key Input -->
                <QInput
                  v-if="shouldShowKeyInput"
                  v-model.number="currentDataKey"
                  type="number"
                  :label="`Key ${dataExists ? '(✓)' : '(✗)'}`"
                  placeholder="Key"
                  min="0"
                  dense
                  outlined
                  :color="dataExists ? 'positive' : 'negative'"
                  :bg-color="dataExists ? 'green-1' : 'red-1'"
                  :class="['compact-input']"
                  @update:model-value="(value) => onKeyChange(value as number)"
                />

                <!-- Action Buttons -->
                <QBtnGroup
                  v-if="
                    (availableSchemas.length > 0 || props.schemaId) &&
                    (shouldShowNewButton ||
                      shouldShowReloadButton ||
                      shouldShowSaveButton ||
                      shouldShowDeleteButton)
                  "
                  flat
                  rounded
                  size="sm"
                  class="compact-btn-group responsive-btn-group"
                >
                  <QBtn
                    v-if="shouldShowNewButton"
                    icon="add"
                    color="grey-6"
                    :disabled="!canCreate || loading"
                    @click="createNew"
                    class="action-btn"
                  >
                    <QTooltip>{{ UI_MESSAGES.TOOLTIPS.NEW }}</QTooltip>
                    <span class="btn-label">{{
                      UI_MESSAGES.TOOLTIPS.NEW
                    }}</span>
                  </QBtn>
                  <QBtn
                    v-if="shouldShowReloadButton"
                    icon="refresh"
                    color="info"
                    :disabled="!canLoad || loading"
                    @click="reloadData"
                    class="action-btn"
                  >
                    <QTooltip>{{ UI_MESSAGES.TOOLTIPS.RELOAD }}</QTooltip>
                    <span class="btn-label">{{
                      UI_MESSAGES.TOOLTIPS.RELOAD
                    }}</span>
                  </QBtn>
                  <QBtn
                    v-if="shouldShowSaveButton"
                    icon="save"
                    color="primary"
                    :disabled="!canSave || loading"
                    type="submit"
                    form="data-form"
                    class="action-btn"
                  >
                    <QTooltip>{{ UI_MESSAGES.TOOLTIPS.SAVE }}</QTooltip>
                    <span class="btn-label">{{
                      UI_MESSAGES.TOOLTIPS.SAVE
                    }}</span>
                  </QBtn>
                  <QBtn
                    v-if="shouldShowDeleteButton"
                    icon="delete"
                    color="grey-6"
                    :disabled="!canDelete || loading"
                    @click="deleteData"
                    class="action-btn"
                  >
                    <QTooltip>{{ UI_MESSAGES.TOOLTIPS.DELETE }}</QTooltip>
                    <span class="btn-label">{{
                      UI_MESSAGES.TOOLTIPS.DELETE
                    }}</span>
                  </QBtn>
                </QBtnGroup>
              </div>
            </div>
          </div>
        </QCardSection>
      </QCard>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <QSkeleton type="text" height="30px" class="q-mb-md" />
      <QSkeleton type="rect" height="300px" />
    </div>

    <!-- Form Content -->
    <div v-else-if="schema || !availableSchemas.length" class="form-content">
      <!-- Form Fields -->
      <div
        v-if="
          schema &&
          formData &&
          Object.keys(formData).length > 0 &&
          (dataExists || isNewMode)
        "
        class="form-fields"
      >
        <QForm ref="formRef" id="data-form" @submit="handleFormSubmit">
          <QCard class="form-fields-card">
            <QCardSection>
              <div class="form-fields-header q-mb-md">
                <h4 class="text-h6 text-grey-8 q-mb-none">
                  {{
                    isNewMode
                      ? UI_MESSAGES.FORM.CREATE_NEW_DATA
                      : UI_MESSAGES.FORM.EDIT_DATA
                  }}
                </h4>
                <p class="text-caption text-grey-6 q-mb-none">
                  {{
                    isNewMode
                      ? UI_MESSAGES.FORM.FILL_FIELDS_TO_CREATE
                      : UI_MESSAGES.FORM.MODIFY_FIELDS_TO_UPDATE
                  }}
                </p>
              </div>
              <div
                class="fields-container"
                :class="`columns-${getRootColumnsLocal()}`"
              >
                <div
                  v-for="fieldInfo in schemaFieldInfos"
                  :key="fieldInfo.key"
                  :class="[
                    `field-span-${getFieldSpanLocal(fieldInfo.key)}`,
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
                    @update:model-value="updateFormData(fieldInfo.key, $event)"
                    @validation-error="
                      handleValidationError(fieldInfo.key, $event)
                    "
                    @validation-success="handleValidationSuccess(fieldInfo.key)"
                    :ref="
                      (el) => {
                        if (el) fieldRefs[fieldInfo.key] = el as any;
                      }
                    "
                  />
                </div>
              </div>
            </QCardSection>
          </QCard>
        </QForm>
      </div>

      <!-- No Data Message -->
      <div v-else-if="!loading && !isNewMode" class="no-data-message">
        <QCard class="empty-state-card">
          <QCardSection class="text-center q-pa-xl">
            <div class="empty-state-content">
              <QIcon
                :name="getEmptyStateIcon()"
                size="4rem"
                :color="getEmptyStateColor()"
                class="q-mb-md"
              />
              <h4 class="text-h6 text-grey-8 q-mb-sm">
                {{ getEmptyStateTitle() }}
              </h4>
              <p class="text-body2 text-grey-6 q-mb-md">
                {{ getEmptyStateMessage() }}
              </p>
              <QBtn
                v-if="shouldShowNewButton && !isNewMode && canCreate"
                icon="add"
                color="primary"
                :label="UI_MESSAGES.FORM.CREATE_NEW"
                @click="createNew"
                class="q-mt-sm"
              />
            </div>
          </QCardSection>
        </QCard>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <QCard class="bg-red-1">
        <QCardSection>
          <div class="text-red-600">
            <QIcon name="error" size="sm" />
            <span class="q-ml-sm">{{ error }}</span>
          </div>
        </QCardSection>
      </QCard>
    </div>
  </div>

  <!-- Diff Dialog - Only render when diff functionality is enabled -->
  <TextDiffDialog
    v-if="props.showDiffBeforeSave"
    v-model="showDiffDialog"
    :current-text="diffStringify(formData)"
    :original-text="diffStringify(originalData)"
    :title="getDialogTitle('SAVE_DATA')"
    subtitle="Review the differences between current and original data"
    :confirm-button-label="UI_MESSAGES.FORM.SAVE"
    cancel-button-color="secondary"
    :full-width="true"
    @ok="performSave"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useQuasar } from "quasar";
import { invoke } from "@tauri-apps/api/core";
import { createDebugLogger } from "@/utils/debug";
import SchemaField from "@/components/schemaform/SchemaField.vue";
import TextDiffDialog from "@/components/TextDiffDialog.vue";
import type { AppSchema } from "@/types/schema";

import { TAURI_COMMANDS } from "@/utils/tauri-commands";
import TOML from "smol-toml";

import {
  getDialogTitle,
  getCommonMessage,
  getSuccessMessage,
  getErrorMessage,
  UI_MESSAGES,
} from "@/utils/ui-constants";
import { initializeSchemaData, resolveSchemaRef } from "@/utils/schema-utils";
import type { FieldLayoutConfig, CompactConfig } from "./types";
import { parseCompactConfig } from "./types";
import {
  getFieldLayout,
  // getRootLayout,
  // getFieldColumns,
  // getFieldSpan,
  getRootColumns,
  getFieldLayoutWithRef,
} from "./layout-utils";
import { fieldPathResolver } from "./ref-path-resolver";

// Type definitions
interface SchemaOption {
  name: string;
  title: string;
}

interface FormData {
  [key: string]: any;
}

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

interface Props {
  // Basic props
  schemaId?: string;
  dataKey?: number;
  title?: string;
  description?: string;

  // Display control
  showHeader?: boolean;
  compact?: boolean | CompactConfig; // Compact mode configuration
  columns?: number; // 0=auto, 1=single column, 2=double column

  // Button control
  showSaveButton?: boolean;
  showDeleteButton?: boolean;
  showNewButton?: boolean;
  showReloadButton?: boolean;

  // Schema and data
  availableSchemas?: SchemaOption[];

  mode?: "appdata" | "config";
  showDiffBeforeSave?: "json" | "toml" | ((obj: object) => string);

  // Modification tracking
  showModificationIndicator?: boolean;

  // Field layout configuration
  fieldLayoutConfig?: FieldLayoutConfig[];

  // Auto-load control
  autoLoad?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  schemaId: "",
  dataKey: 1,
  title: "",
  description: "",
  showHeader: true,
  compact: true,
  columns: 0, // 0=auto, 1=single column, 2=double column
  showSaveButton: true,
  showDeleteButton: true,
  showNewButton: true,
  showReloadButton: true,
  availableSchemas: () => [],
  mode: "appdata",
  showDiffBeforeSave: "toml", // Default to TOML format
  showModificationIndicator: true, // Show modification indicators
  fieldLayoutConfig: () => [], // Field layout configuration
  autoLoad: true, // Auto-load data when component mounts
});

const emit = defineEmits<{
  "update:model-value": [value: any];
  save: [data: any];
  load: [data: any];
  delete: [];
  reload: [data?: any];
  prepare: [data: any];
  "schema-change": [schemaId: string];
  "key-change": [key: number];
  "validation-error": [key: string, error: string];
  "validation-success": [key: string];
  notify: [notification: { type: string; message: string }];
  reset: [];
  create: [];
}>();

const $q = useQuasar();
const debug = createDebugLogger("SchemaDataForm");

// Notification helper function
const showNotification = (type: string, message: string) => {
  emit("notify", { type, message });
};

// ===== Internal State =====
const schema = ref<AppSchema | null>(null);
const formData = ref<FormData>({});
const originalData = ref<FormData>({});

const loading = ref(false);
const error = ref("");
const dataExists = ref(false);
const selectedSchema = ref("");
const currentDataKey = ref(props.dataKey);
// Parse compact configuration
const compactConfig = computed(() => {
  const isMobile = $q.screen.lt.md;
  return parseCompactConfig(props.compact, isMobile);
});

const compactMode = ref(compactConfig.value.compact);
const isNewMode = ref(false); // Track if we're in "new" mode
const fieldRefs = ref<FieldRefs>({}); // Store field component references
const formRef = ref<FormRef | null>(null); // Form reference for validation
const showDiffDialog = ref(false); // Control diff dialog visibility

// ===== Helper Functions =====
const getInitialSchemaId = () => {
  // If schemaId is provided, use it directly
  if (props.schemaId) {
    return props.schemaId;
  }
  // Otherwise, try to get from availableSchemas
  return props.availableSchemas && props.availableSchemas.length > 0
    ? props.availableSchemas[0].name
    : "";
};

// ===== Computed Properties =====
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value);
});

const hasValidationErrors = computed(() => {
  return false; // Now handled by Quasar form validation
});

const canLoad = computed(() => {
  return (
    selectedSchema.value &&
    currentDataKey.value !== null &&
    currentDataKey.value !== undefined
  );
});

const canSave = computed(() => {
  return (
    selectedSchema.value &&
    !hasValidationErrors.value &&
    (hasChanges.value || isNewMode.value) // Allow save only when there are changes or in new mode
  );
});

const canDelete = computed(() => {
  return selectedSchema.value && dataExists.value;
});

const canCreate = computed(() => {
  return (
    selectedSchema.value &&
    currentDataKey.value !== null &&
    currentDataKey.value !== undefined &&
    !isNewMode.value // Disable when in new mode
  );
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

      fieldInfos.push({
        key,
        schema: resolvedSchema,
        value: formData.value[key],
        fieldPath: resolvedInfo.fieldPath,
        isRefField: resolvedInfo.isRefField,
        refPath: resolvedInfo.refPath,
      });
    });
  }

  return fieldInfos;
});

// ===== Field Layout Functions =====
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

// ===== Button Visibility Logic =====
const shouldShowKeyInput = computed(() => {
  return props.mode === "appdata";
});

const shouldShowNewButton = computed(() => {
  return props.showNewButton && props.mode === "appdata";
});

const shouldShowDeleteButton = computed(() => {
  return props.showDeleteButton && props.mode === "appdata";
});

const shouldShowReloadButton = computed(() => {
  return props.showReloadButton; // Show reload button in both modes
});

const shouldShowSaveButton = computed(() => {
  return props.showSaveButton; // Show save button in both modes
});

// ===== Core Methods =====
const getInvokeCommand = (command: string): string => {
  // Both appdata and config modes use the same appdata commands
  switch (command) {
    case "get_schema":
      return TAURI_COMMANDS.APPDATA.GET_SCHEMA;
    case "get_data":
      return TAURI_COMMANDS.APPDATA.GET_DATA;
    case "save_data":
      return TAURI_COMMANDS.APPDATA.SAVE_DATA;
    case "remove_data":
      return TAURI_COMMANDS.APPDATA.REMOVE_DATA;
    case "exists_data":
      return TAURI_COMMANDS.APPDATA.EXISTS_DATA;
    case "find_next_available_key":
      return TAURI_COMMANDS.APPDATA.FIND_NEXT_AVAILABLE_KEY;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
};

const loadSchema = async (schemaId: string, showDialog = false) => {
  if (!schemaId) {
    if (showDialog) {
      $q.dialog({
        title: getDialogTitle("ERROR"),
        message: getCommonMessage("SCHEMA_ID_REQUIRED"),
        ok: true,
        persistent: true,
      });
    }
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const command = getInvokeCommand("get_schema");
    const paramName = props.mode === "config" ? "schemaId" : "schemaId";
    const schemaData = await invoke(command, {
      [paramName]: schemaId,
    });
    schema.value = schemaData as AppSchema;

    // Format and output schema JSON
    debug.log(`Schema loaded for: ${schemaId}`);
    debug.log("Schema data:\n" + JSON.stringify(schemaData, null, 2));

    emit("schema-change", schemaId);
  } catch (err) {
    error.value = `${getErrorMessage("FAILED_TO_LOAD_SCHEMA")}: ${err}`;
    debug.error("Schema load error", err);
    if (showDialog) {
      $q.dialog({
        title: getDialogTitle("ERROR"),
        message: `${getErrorMessage("FAILED_TO_LOAD_SCHEMA")}: ${err}`,
        ok: true,
        persistent: true,
      });
    }
  } finally {
    loading.value = false;
  }
};

const loadData = async (showDialog = false) => {
  if (!canLoad.value) {
    if (showDialog) {
      $q.dialog({
        title: getDialogTitle("ERROR"),
        message: getCommonMessage("CANNOT_LOAD_DATA"),
        ok: true,
        persistent: true,
      });
    }
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const command = getInvokeCommand("get_data");
    // config mode key=0
    const key = props.mode === "config" ? 0 : currentDataKey.value;
    const params = { schemaId: selectedSchema.value, key };

    const dataBytes = await invoke(command, params);

    if (dataBytes && Array.isArray(dataBytes) && dataBytes.length > 0) {
      const data = JSON.parse(
        new TextDecoder().decode(new Uint8Array(dataBytes))
      );

      // Schema validation is now handled by the backend

      // Print loaded data to console in JSON format
      debug.log("Data Form Load - Data:");
      debug.log(JSON.stringify(data, null, 2));

      formData.value = data;
      originalData.value = JSON.parse(JSON.stringify(data));
      dataExists.value = true;
      isNewMode.value = false; // Exit new mode when loading existing data
      emit("load", data);
    } else {
      // Ensure schema is loaded for form structure
      if (!schema.value) {
        await loadSchema(selectedSchema.value, showDialog);
      }
      // Clear form data when no data exists
      formData.value = {};
      originalData.value = {};
      dataExists.value = false;
      isNewMode.value = false; // Reset new mode when loading data
      emit("load", null);
    }
  } catch (err) {
    error.value = `${getErrorMessage("FAILED_TO_LOAD_DATA")}: ${err}`;
    debug.error("Data load error", err);
    if (showDialog) {
      $q.dialog({
        title: getDialogTitle("ERROR"),
        message: `${getErrorMessage("FAILED_TO_LOAD_DATA")}: ${err}`,
        ok: true,
        persistent: true,
      });
    }
  } finally {
    loading.value = false;
  }
};

const diffStringify = (obj: object) => {
  // Defensive programming: ensure we have a valid object
  if (!obj || typeof obj !== "object") {
    return "";
  }

  // Handle different diff formats
  if (props.showDiffBeforeSave === "json") {
    return JSON.stringify(obj, null, 2);
  }
  if (props.showDiffBeforeSave === "toml") {
    return TOML.stringify(obj);
  }
  if (typeof props.showDiffBeforeSave === "function") {
    try {
      return props.showDiffBeforeSave(obj);
    } catch (error) {
      debug.warn("Custom diff function failed, falling back to JSON", error);
      return JSON.stringify(obj, null, 2);
    }
  }

  // Fallback to JSON for unknown formats
  return JSON.stringify(obj, null, 2);
};

const handleFormSubmit = async (evt?: Event) => {
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

  // Call the original saveData logic
  await saveData();
};

const saveData = async () => {
  if (!canSave.value) return;

  // Validation is already handled by QForm in handleFormSubmit
  // No need for additional validation here

  emit("validation-success", "");

  // Schema validation is now handled by the backend

  // Show diff dialog if enabled
  if (props.showDiffBeforeSave && hasChanges.value) {
    showDiffDialog.value = true;
  } else {
    $q.dialog({
      title: getDialogTitle("SAVE_DATA"),
      message: getCommonMessage("SAVE_CONFIRMATION"),
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      await performSave();
    });
  }
};

const performSave = async () => {
  loading.value = true;
  error.value = "";

  try {
    const command = getInvokeCommand("save_data");
    // Use key=0 for config mode
    const key = props.mode === "config" ? 0 : currentDataKey.value;
    const dataWithKey = { ...formData.value, id: key };
    const dataBytes = new TextEncoder().encode(JSON.stringify(dataWithKey));

    // Print form data to console in JSON format
    debug.log("Data Form Submit - Parameters:");
    debug.log(JSON.stringify(dataWithKey, null, 2));

    const params = {
      schemaId: selectedSchema.value,
      data: Array.from(dataBytes),
    };

    await invoke(command, params);

    // Update original data and mark as existing
    originalData.value = JSON.parse(JSON.stringify(formData.value));
    dataExists.value = true;
    isNewMode.value = false; // Exit new mode after successful save

    showNotification(
      "positive",
      dataExists.value
        ? getSuccessMessage("DATA_UPDATED")
        : getSuccessMessage("NEW_DATA_CREATED")
    );

    emit("save", formData.value);
  } catch (err) {
    error.value = `${getErrorMessage("FAILED_TO_SAVE_DATA")}: ${err}`;
    showNotification(
      "negative",
      `${getErrorMessage("FAILED_TO_SAVE_DATA")}: ${err}`
    );
    debug.error("Data save error", err);
  } finally {
    loading.value = false;
  }
};

const createNew = async () => {
  if (!canCreate.value) return;

  loading.value = true;
  error.value = "";

  try {
    // Find the next available key starting from current key
    const startKey = props.mode === "config" ? 0 : currentDataKey.value;
    const command = getInvokeCommand("find_next_available_key");
    const nextKey = await invoke(command, {
      schemaId: selectedSchema.value,
      startKey,
    });

    // Update the current key to the next available key
    currentDataKey.value = nextKey as number;

    // Load schema and generate default values
    await loadSchema(selectedSchema.value, false); // Don't show dialog for create new

    // Generate default values for new data using schema traversal
    if (schema.value) {
      const defaultData = initializeSchemaData(schema.value, schema.value, 10);

      // Print default data to console in JSON format
      debug.log("Data Form Create New - Default Data:");
      debug.log(JSON.stringify(defaultData, null, 2));

      formData.value = defaultData;
      originalData.value = JSON.parse(JSON.stringify(defaultData));
    }
    dataExists.value = false;
    isNewMode.value = true; // Enter new mode

    showNotification(
      "info",
      `Form prepared for new data with key ${nextKey}. Fill in the fields and click ${UI_MESSAGES.FORM.SAVE} to create.`
    );

    emit("prepare", formData.value); // Emit prepare event instead of create
    emit("key-change", nextKey as number);
  } catch (err) {
    error.value = `${getErrorMessage("FAILED_TO_PREPARE_NEW_DATA")}: ${err}`;
    showNotification(
      "negative",
      `${getErrorMessage("FAILED_TO_PREPARE_NEW_DATA")}: ${err}`
    );
    debug.error("Data creation preparation error", err);
  } finally {
    loading.value = false;
  }
};

const deleteData = async () => {
  if (!canDelete.value) return;

  $q.dialog({
    title: getDialogTitle("DELETE_DATA"),
    message: getCommonMessage("DELETE_CONFIRMATION"),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    loading.value = true;
    error.value = "";

    try {
      const command = getInvokeCommand("remove_data");
      // Use key=0 for config mode
      const key = props.mode === "config" ? 0 : currentDataKey.value;

      await invoke(command, {
        schemaId: selectedSchema.value,
        key,
      });

      await loadSchema(selectedSchema.value);
      dataExists.value = false;

      showNotification("positive", getSuccessMessage("DATA_DELETED"));

      emit("delete");
    } catch (err) {
      error.value = `${getErrorMessage("FAILED_TO_DELETE_DATA")}: ${err}`;
      showNotification(
        "negative",
        `${getErrorMessage("FAILED_TO_DELETE_DATA")}: ${err}`
      );
      debug.error("Data delete error", err);
    } finally {
      loading.value = false;
    }
  });
};

const reloadData = async () => {
  if (!canLoad.value) return;

  // Check if there are unsaved changes
  if (hasChanges.value) {
    // Show confirmation dialog if there are changes
    $q.dialog({
      title: getDialogTitle("RELOAD_DATA"),
      message: getCommonMessage("RELOAD_CONFIRMATION"),
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      await handleReloadWithFeedback();
    });
  } else {
    // Directly reload if no changes
    await handleReloadWithFeedback();
  }
};

const handleReloadWithFeedback = async () => {
  // Clear previous error
  error.value = "";

  await loadData(true); // Pass true to show dialog on error

  // Check if there was an error
  if (error.value) {
    // Error was already shown via dialog, just log it
    debug.error("Reload error", error.value);
  } else {
    // Show success notification
    showNotification("positive", getSuccessMessage("DATA_RELOADED"));
    emit("reload", formData.value);
  }
};

const updateFormData = (key: string, value: any) => {
  debug.log(`Field update: ${key} =`, value);
  formData.value[key] = value;
  debug.log("Updated formData:", formData.value);
  emit("update:model-value", formData.value);
};

const handleValidationError = (key: string, error: string) => {
  emit("validation-error", key, error);
};

const handleValidationSuccess = (key: string) => {
  emit("validation-success", key);
};

const isFieldModified = (fieldPath: string) => {
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

const isNestedFieldModified = (parentKey: string, childKey: string) => {
  const currentParent = formData.value[parentKey] || {};
  const originalParent = originalData.value[parentKey] || {};
  const currentValue = currentParent[childKey];
  const originalValue = originalParent[childKey];
  return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
};

const onSchemaChange = (newSchema: SchemaOption) => {
  selectedSchema.value = newSchema.name; // Store the schema id string, not the object
  loadSchema(newSchema.name);
};

const onKeyChange = (newKey: number) => {
  currentDataKey.value = newKey;
  isNewMode.value = false; // Exit new mode when key changes
  emit("key-change", newKey);

  // Always load data when key changes to update dataExists status
  if (selectedSchema.value) {
    loadData();
  }
};

// ===== Empty State Helper Methods =====
const getEmptyStateIcon = () => {
  if (!props.availableSchemas.length) {
    return "settings";
  }
  if (isNewMode.value) {
    return "edit";
  }
  if (dataExists.value) {
    return "info";
  }
  return "add_circle";
};

const getEmptyStateColor = () => {
  if (!props.availableSchemas.length) {
    return "grey-6";
  }
  if (isNewMode.value) {
    return "primary";
  }
  if (dataExists.value) {
    return "info";
  }
  return "grey-6";
};

const getEmptyStateTitle = () => {
  if (!props.availableSchemas.length) {
    return UI_MESSAGES.EMPTY_STATE.NO_SCHEMAS_AVAILABLE;
  }
  if (isNewMode.value) {
    return UI_MESSAGES.EMPTY_STATE.READY_TO_CREATE;
  }
  if (dataExists.value) {
    return UI_MESSAGES.EMPTY_STATE.NO_FORM_FIELDS;
  }
  return UI_MESSAGES.EMPTY_STATE.NO_DATA_FOUND;
};

const getEmptyStateMessage = () => {
  if (!props.availableSchemas.length) {
    return UI_MESSAGES.EMPTY_STATE.CONFIGURE_SCHEMAS;
  }
  if (isNewMode.value) {
    return UI_MESSAGES.EMPTY_STATE.FORM_READY_FOR_NEW_DATA.replace(
      "{key}",
      currentDataKey.value.toString()
    );
  }
  if (dataExists.value) {
    return UI_MESSAGES.EMPTY_STATE.NO_FORM_FIELDS_AVAILABLE;
  }
  return UI_MESSAGES.EMPTY_STATE.NO_DATA_FOUND_FOR_KEY.replace(
    "{key}",
    currentDataKey.value.toString()
  );
};

// Watch for prop changes
watch(
  () => props.schemaId,
  () => {
    const newSelectedSchema = getInitialSchemaId();
    if (newSelectedSchema && newSelectedSchema !== selectedSchema.value) {
      selectedSchema.value = newSelectedSchema;
      loadSchema(newSelectedSchema);
    }
  }
);

watch(
  () => props.availableSchemas,
  () => {
    const newSelectedSchema = getInitialSchemaId();
    if (newSelectedSchema && newSelectedSchema !== selectedSchema.value) {
      selectedSchema.value = newSelectedSchema;
      loadSchema(newSelectedSchema);
    }
  },
  { deep: true }
);

watch(
  () => props.dataKey,
  (newKey) => {
    if (newKey !== currentDataKey.value) {
      currentDataKey.value = newKey;
      // Always load data when dataKey prop changes
      loadData();
    }
  }
);

watch(
  () => compactConfig.value,
  (newConfig) => {
    compactMode.value = newConfig.compact;
  }
);

// Initialize on mount
onMounted(async () => {
  // Initialize selectedSchema with proper value
  const initialSchemaId = getInitialSchemaId();
  if (initialSchemaId) {
    selectedSchema.value = initialSchemaId;
    await loadSchema(initialSchemaId);
    // Always try to load data when schema is available
    await loadData();
  }
});

// Cleanup on component unmount
onUnmounted(() => {
  // Clear field refs to prevent memory leaks
  fieldRefs.value = {};
});

// Expose methods for parent components
defineExpose({
  getFormData: () => formData.value,
  setFormData: (data: FormData) => {
    formData.value = { ...data };
    originalData.value = JSON.parse(JSON.stringify(data));
  },
  loadSchema,
  loadData,
  saveData,
  deleteData,
  hasChanges,
  hasValidationErrors,
  dataExists,
});
</script>

<style scoped>
.appdata-form {
  width: 100%;
}

.form-header {
  margin-bottom: 1rem;
}

.compact-header {
  border-radius: 8px;
}

.compact-header .q-card__section {
  padding: 0.75rem;
}

.compact-select {
  min-width: 140px;
  max-width: 220px;
}

.compact-input {
  width: 90px;
  min-width: 90px;
}

.compact-btn-group {
  min-width: auto;
}

.compact-btn-group .q-btn {
  min-width: 32px;
  padding: 0 8px;
}

.compact-toggle {
  min-width: 32px;
}

/* ===== Key Input Status Styles ===== */
.compact-input.q-field--focused .q-field__control {
  border-color: var(--q-primary, #1976d2) !important;
}

.compact-input.q-field--error .q-field__control {
  border-color: var(--q-negative, #c10015) !important;
}

.loading-container {
  padding: 0.5rem;
}

.form-fields {
  width: 100%;
}

.form-fields-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.form-fields-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.error-container {
  padding: 0.5rem;
}

.no-data-message {
  padding: 0.5rem;
}

.empty-state-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.empty-state-content {
  max-width: 400px;
  margin: 0 auto;
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

/* Responsive Button Group */
.responsive-btn-group {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2px;
}

/* Action Button Styles */
.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-label {
  display: none;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Mobile responsiveness */
@media (max-width: 599px) {
  .compact-select {
    min-width: 120px;
    max-width: 180px;
  }

  .compact-input {
    width: 80px;
    min-width: 80px;
  }

  .form-header .row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-header .col-auto {
    margin-top: 0.5rem;
  }

  .form-header .row.q-col-gutter-sm {
    justify-content: center;
  }

  /* Mobile button group layout */
  .responsive-btn-group {
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  .responsive-btn-group .q-btn {
    width: 100%;
    min-height: 48px;
    border-radius: 12px;
    margin: 0;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Improve button spacing and touch targets */
  .responsive-btn-group .q-btn:not(:last-child) {
    margin-bottom: 4px;
  }

  /* Add subtle hover effects for better UX */
  .responsive-btn-group .q-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
  }

  /* Show button labels on mobile */
  .btn-label {
    display: inline-block;
  }

  /* Improve button layout for mobile */
  .action-btn {
    justify-content: flex-start;
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>

<template>
  <q-page class="q-pa-md">
    <!-- Configuration Editor Header -->
    <div class="row q-mb-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold">Configuration Editor</h1>
                <p class="text-gray-600">
                  Edit application settings and preview configuration
                </p>
              </div>
              <div class="row q-gutter-sm">
                <q-btn
                  icon="refresh"
                  color="secondary"
                  label="Reset"
                  @click="resetConfig"
                />
                <q-btn
                  icon="save"
                  color="primary"
                  label="Save Configuration"
                  :disabled="!hasChanges"
                  @click="saveConfig"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Content Layout -->
    <div class="row q-col-gutter-md" style="height: calc(100vh - 200px)">
      <!-- Settings Panel -->
      <div class="col-12 lg:col-6">
        <q-card class="full-height">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="row items-center q-gutter-sm">
                <h2 class="text-xl font-semibold">Settings</h2>
              </div>
              <q-btn
                icon="visibility"
                :color="showAdvanced ? 'primary' : 'grey'"
                size="sm"
                @click="showAdvanced = !showAdvanced"
              >
                <q-tooltip
                  >Toggle advanced options (show/hide detailed descriptions and
                  validation rules)</q-tooltip
                >
              </q-btn>
            </div>

            <!-- Configuration Form -->
            <div v-if="schema" class="q-gutter-md settings-form-container">
              <!-- Schema Information -->
              <q-card
                v-if="schema.title || schema.description"
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

              <!-- Simple Form Fields -->
              <div
                v-for="key in Object.keys(formData)"
                :key="key"
                class="q-mb-md"
              >
                <config-field
                  :schema="schema.properties[key]"
                  :root-schema="schema"
                  :model-value="formData[key]"
                  :show-advanced="showAdvanced"
                  :is-modified="isFieldModified(key)"
                  :parent-key="key"
                  :check-nested-modification="isNestedFieldModified"
                  @update:model-value="updateFormData(key, $event)"
                />
              </div>
            </div>

            <!-- Loading State -->
            <div v-else>
              <q-skeleton type="text" height="30px" class="q-mb-md" />
              <q-skeleton type="rect" height="300px" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- TOML Preview Panel -->
      <div class="col-12 lg:col-6">
        <q-card class="full-height">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <h2 class="text-xl font-semibold">Preview (TOML)</h2>
              <div class="row q-gutter-sm">
                <q-btn icon="copy_all" size="sm" @click="copyToClipboard">
                  <q-tooltip>Copy to clipboard</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- TOML Preview Content -->
            <div class="toml-preview-container">
              <pre
                class="toml-preview"
                v-html="tomlPreview"
                ref="tomlPreviewRef"
              ></pre>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from "vue";
import { useQuasar } from "quasar";
import { invoke } from "@tauri-apps/api/core";
import ConfigField from "@/components/ConfigField.vue";
import TOML from "smol-toml";

// State
const schema = ref(null);
const formData = ref({});
const originalData = ref({}); // Store original data for comparison
const tomlPreview = ref("");
const showAdvanced = ref(false);
const $q = useQuasar();

// Computed properties
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value);
});

// Check if save button should be enabled
const canSave = computed(() => {
  return hasChanges.value;
});

// TOML conversion function with modification highlighting
const convertToToml = (obj, prefix = "", modifiedPaths = new Set()) => {
  let toml = "";

  // Use object's own property order
  const allKeys = Object.keys(obj);

  for (const key of allKeys) {
    const value = obj[key];
    if (value === undefined) continue;

    const fullKey = prefix ? `${prefix}.${key}` : key;
    const isModified = modifiedPaths.has(fullKey);
    const modifiedStyle = isModified
      ? ` style="background-color: #fff3cd !important; border-left: 3px solid #ffc107 !important; padding: 2px 4px !important; border-radius: 3px !important; display: inline-block !important; margin: 2px 0 !important;"`
      : "";

    if (value === null || value === undefined) {
      toml += `<span${modifiedStyle}># ${key} = null</span>\n`;
    } else if (typeof value === "object" && !Array.isArray(value)) {
      toml += `\n<span class="section">[${fullKey}]</span>\n`;
      toml += convertToToml(value, fullKey, modifiedPaths);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        toml += `<span${modifiedStyle}><span class="key">${key}</span> = []</span>\n`;
      } else if (typeof value[0] === "string") {
        toml += `<span${modifiedStyle}><span class="key">${key}</span> = [${value
          .map((v) => `<span class="string">"${v}"</span>`)
          .join(", ")}]</span>\n`;
      } else {
        toml += `<span${modifiedStyle}><span class="key">${key}</span> = [${value
          .map((v) => `<span class="number">${v}</span>`)
          .join(", ")}]</span>\n`;
      }
    } else if (typeof value === "string") {
      toml += isModified
        ? `<div${modifiedStyle}><span class="key">${key}</span> = <span class="string">"${value}"</span></div>\n`
        : `<span><span class="key">${key}</span> = <span class="string">"${value}"</span></span>\n`;
    } else if (typeof value === "boolean") {
      toml += isModified
        ? `<div${modifiedStyle}><span class="key">${key}</span> = <span class="boolean">${value}</span></div>\n`
        : `<span><span class="key">${key}</span> = <span class="boolean">${value}</span></span>\n`;
    } else {
      toml += isModified
        ? `<div${modifiedStyle}><span class="key">${key}</span> = <span class="number">${value}</span></div>\n`
        : `<span><span class="key">${key}</span> = <span class="number">${value}</span></span>\n`;
    }
  }

  return toml;
};

// Get all modified field paths (only leaf nodes)
const getModifiedPaths = () => {
  const modifiedPaths = new Set();

  const checkObject = (obj, originalObj, prefix = "") => {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const originalValue = originalObj?.[key];

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Nested object - check its children
        checkObject(value, originalValue, fullKey);
      } else if (JSON.stringify(value) !== JSON.stringify(originalValue)) {
        // Modified leaf field - only add the actual modified field
        modifiedPaths.add(fullKey);
      }
    }
  };

  checkObject(formData.value, originalData.value);
  return modifiedPaths;
};

// Check if a field has been modified (only for top-level fields)
const isFieldModified = (fieldPath) => {
  const currentValue = formData.value[fieldPath];
  const originalValue = originalData.value[fieldPath];

  // For objects, never mark the parent as modified
  // Only mark if it's a direct value change (not a nested object)
  if (
    typeof currentValue === "object" &&
    currentValue !== null &&
    !Array.isArray(currentValue)
  ) {
    return false; // Objects are never marked as modified themselves
  }

  return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
};

// Check if a nested field is modified (for nested objects)
const isNestedFieldModified = (parentKey, childKey) => {
  const currentParent = formData.value[parentKey] || {};
  const originalParent = originalData.value[parentKey] || {};
  const currentValue = currentParent[childKey];
  const originalValue = originalParent[childKey];
  return JSON.stringify(currentValue) !== JSON.stringify(originalValue);
};

// Load configuration data on component mount
onMounted(async () => {
  try {
    const [configSchema, currentConfig] = await Promise.all([
      invoke("cfg_cmd_get_schema"),
      invoke("cfg_cmd_get_data"),
    ]);

    schema.value = configSchema;
    formData.value = currentConfig;
    originalData.value = JSON.parse(JSON.stringify(currentConfig)); // Deep copy
  } catch (error) {
    $q.notify({
      type: "negative",
      message: `Failed to load configuration: ${error.message}`,
      position: "top",
    });
    console.error("Configuration load error:", error);
  }
});

// Update TOML preview when form data changes
watch(
  [formData, originalData],
  ([newFormData, newOriginalData]) => {
    try {
      const modifiedPaths = getModifiedPaths();
      const tomlHtml = convertToToml(newFormData, "", modifiedPaths);
      tomlPreview.value = tomlHtml;
    } catch (error) {
      tomlPreview.value = `Error generating TOML: ${error.message}`;
    }
  },
  { deep: true, immediate: true }
);

// Event handlers
const updateFormData = (key, value) => {
  formData.value[key] = value;
};

const resetConfig = () => {
  $q.dialog({
    title: "Reset Configuration",
    message: "Are you sure you want to reset all settings to default?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    invoke("cfg_cmd_get_data")
      .then((resetData) => {
        formData.value = resetData;
        originalData.value = JSON.parse(JSON.stringify(resetData));
        $q.notify({
          type: "positive",
          message: "Configuration reset successfully",
          position: "top",
        });
      })
      .catch((error) => {
        console.error("Backend APIs not available", error);
        $q.notify({
          type: "negative",
          message: `Failed to reset configuration: ${error}`,
          position: "top",
        });
      });
  });
};

const saveConfig = () => {
  $q.dialog({
    title: "Save Configuration",
    message: "Are you sure you want to save the current configuration?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    invoke("cfg_cmd_save_data", { config: formData.value })
      .then(() => {
        $q.notify({
          type: "positive",
          message: "Configuration saved successfully",
          position: "top",
        });
        // Update original data after successful save
        originalData.value = JSON.parse(JSON.stringify(formData.value));
      })
      .catch((error) => {
        $q.notify({
          type: "negative",
          message: `Failed to save configuration: ${error}`,
          position: "top",
        });
      });
  });
};

const copyToClipboard = async () => {
  try {
    // Use native clipboard API
    await navigator.clipboard.writeText(TOML.stringify(formData.value));
    $q.notify({
      type: "positive",
      message: "Configuration copied to clipboard",
      position: "top",
      timeout: 2000,
    });
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    $q.notify({
      type: "negative",
      message: "Failed to copy to clipboard",
      position: "top",
      timeout: 2000,
    });
  }
};
</script>

<style>
.full-height {
  height: 100%;
}

.settings-form-container {
  height: calc(100% - 80px);
  overflow-y: auto;
  padding-right: 8px;
}

.toml-preview-container {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  height: calc(100% - 60px);
  min-height: 300px;
  overflow: auto;
}

.toml-preview {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #333;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  user-select: text;
}

/* Section headers */
.toml-preview .section {
  color: #005cc5;
  font-weight: bold;
  display: block;
}

/* Keys */
.toml-preview .key {
  color: #22863a;
  font-weight: 500;
}

/* Values */
.toml-preview .string {
  color: #d73a49;
}

.toml-preview .number {
  color: #005cc5;
}

.toml-preview .boolean {
  color: #6f42c1;
  font-weight: 500;
}

.toml-preview .comment {
  color: #6a737d;
  font-style: italic;
}

/* Force TOML syntax highlighting */
.toml-preview .section {
  color: #005cc5 !important;
  font-weight: bold !important;
}

.toml-preview .key {
  color: #22863a !important;
  font-weight: 500 !important;
}

.toml-preview .string {
  color: #d73a49 !important;
}

.toml-preview .number {
  color: #005cc5 !important;
}

.toml-preview .boolean {
  color: #6f42c1 !important;
  font-weight: 500 !important;
}
</style>

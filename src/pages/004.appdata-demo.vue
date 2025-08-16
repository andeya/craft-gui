<template>
  <QPage class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Page Header -->
      <div class="col-12">
        <QCard>
          <QCardSection>
            <h1 class="text-2xl font-bold">AppData Form Demo</h1>
            <p class="text-gray-600">
              This page demonstrates the AppDataForm component with actual
              working schemas. Try selecting different schemas and data keys to
              see the form in action.
            </p>
          </QCardSection>
        </QCard>
      </div>

      <!-- AppData Form -->
      <div class="col-12">
        <QCard>
          <QCardSection>
            <h2 class="text-xl font-semibold q-mb-md">SchemaDataForm Demo</h2>
            <p class="text-gray-600 q-mb-md">
              This demonstrates the SchemaDataForm component for data
              management. Select a schema and data key to start editing.
            </p>

            <!-- Data Form Configuration -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-6">
                <QSelect
                  v-model="dataFormColumns"
                  :options="[
                    { label: 'Auto', value: 0 },
                    { label: 'Single Column', value: 1 },
                    { label: 'Double Column', value: 2 },
                    { label: 'Triple Column', value: 3 },
                  ]"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  label="Field Columns Layout"
                  outlined
                  dense
                  @update:model-value="handleDataFormColumnsChange"
                />
              </div>
            </div>

            <SchemaDataForm
              title="Dynamic Data Form"
              description="Select a schema and data key to start editing"
              :available-schemas="availableSchemas"
              :auto-load="false"
              :columns="dataFormColumns"
              :field-layout-config="[
                // { fieldPath: undefined, columns: 3 }, // First level fields in 3 columns
                // { fieldPath: 'complexField', columns: 3, span: 2 }, // Complex field sub-fields in 3 columns, spans 2 columns
                // { fieldPath: 'simpleField', columns: 1, span: 1 }, // Simple field sub-fields in 1 column, spans 1 column
              ]"
              @save="handleSave"
              @load="handleLoad"
              @delete="handleDelete"
              @reset="handleReset"
              @create="handleCreate"
              @prepare="handlePrepare"
              @schema-change="handleSchemaChange"
              @key-change="handleKeyChange"
            />
          </QCardSection>
        </QCard>
      </div>

      <!-- SchemaApiForm Demo -->
      <div class="col-12">
        <QCard>
          <QCardSection>
            <h2 class="text-xl font-semibold q-mb-md">SchemaApiForm Demo</h2>
            <p class="text-gray-600 q-mb-md">
              This demonstrates the SchemaApiForm component for API interface
              calls. Select a schema to see the form with default values and
              validation.
            </p>

            <!-- Schema Selection and Layout Control -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <QSelect
                  v-model="selectedApiSchema"
                  :options="availableSchemas"
                  option-label="title"
                  option-value="name"
                  emit-value
                  map-options
                  label="Select Schema for API Form"
                  outlined
                  dense
                  @update:model-value="handleApiSchemaChange"
                />
              </div>
              <div class="col-12 col-md-4">
                <QSelect
                  v-model="apiColumns"
                  :options="[
                    { label: 'Auto', value: 0 },
                    { label: 'Single Column', value: 1 },
                    { label: 'Double Column', value: 2 },
                    { label: 'Triple Column', value: 3 },
                  ]"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  label="API Form Columns Layout"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <QBtn
                  v-if="selectedApiSchema"
                  label="Reset Form"
                  icon="refresh"
                  color="secondary"
                  @click="resetApiForm"
                />
              </div>
            </div>

            <!-- SchemaApiForm Component -->
            <div v-if="selectedApiSchema">
              <SchemaApiForm
                :schema-id="selectedApiSchema"
                :initial-data="apiFormInitialData"
                :submit-button-text="apiSubmitButtonText"
                :submit-button-icon="apiSubmitButtonIcon"
                :reset-button-text="apiResetButtonText"
                :reset-button-icon="apiResetButtonIcon"
                :clear-button-text="apiClearButtonText"
                :clear-button-icon="apiClearButtonIcon"
                :show-reset-button="true"
                :show-clear-button="true"
                :compact="apiCompactMode"
                :columns="apiColumns"
                @submit="handleApiSubmit"
                @reset="handleApiReset"
                @clear="handleApiClear"
                @validation-error="handleApiValidationError"
                @validation-success="handleApiValidationSuccess"
                @schema-loaded="handleApiSchemaLoaded"
                @schema-error="handleApiSchemaError"
              />
            </div>

            <!-- API Form Configuration -->
            <div v-if="selectedApiSchema" class="q-mt-md">
              <QExpansionItem
                icon="settings"
                label="API Form Configuration"
                header-class="text-primary"
              >
                <QCard>
                  <QCardSection>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <QInput
                          v-model="apiSubmitButtonText"
                          label="Submit Button Text"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <QInput
                          v-model="apiSubmitButtonIcon"
                          label="Submit Button Icon"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <QInput
                          v-model="apiResetButtonText"
                          label="Reset Button Text"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <QInput
                          v-model="apiResetButtonIcon"
                          label="Reset Button Icon"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <QInput
                          v-model="apiClearButtonText"
                          label="Clear Button Text"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <QInput
                          v-model="apiClearButtonIcon"
                          label="Clear Button Icon"
                          outlined
                          dense
                        />
                      </div>

                      <div class="col-12 col-md-6">
                        <QToggle
                          v-model="apiCompactMode"
                          label="Compact Mode"
                          color="primary"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <QSelect
                          v-model="apiColumns"
                          :options="[
                            { label: 'Auto', value: 0 },
                            { label: 'Single Column', value: 1 },
                            { label: 'Double Column', value: 2 },
                          ]"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          label="Field Columns"
                          outlined
                          dense
                        />
                      </div>
                    </div>
                  </QCardSection>
                </QCard>
              </QExpansionItem>
            </div>
          </QCardSection>
        </QCard>
      </div>

      <!-- Instructions -->
      <div class="col-12">
        <QCard>
          <QCardSection>
            <h2 class="text-xl font-semibold q-mb-md">How to Test</h2>

            <div class="q-gutter-md">
              <div>
                <h3 class="text-lg font-medium q-mb-sm">1. Select a Schema</h3>
                <p class="text-gray-600">
                  Choose from "User Profile", "Product Configuration", or
                  "System Settings" in the dropdown. Each schema has different
                  fields and validation rules.
                </p>
              </div>

              <div>
                <h3 class="text-lg font-medium q-mb-sm">2. Enter a Data Key</h3>
                <p class="text-gray-600">
                  Enter a number (e.g., 1, 2, 3) to identify your data record.
                  Different keys can store different data for the same schema.
                </p>
              </div>

              <div>
                <h3 class="text-lg font-medium q-mb-sm">
                  3. Create New or Load Data
                </h3>
                <p class="text-gray-600">
                  Click "New" to create new data with the specified key, or
                  click "Load" to retrieve existing data. If no data exists for
                  the key, you'll see default values from the schema.
                </p>
              </div>

              <div>
                <h3 class="text-lg font-medium q-mb-sm">4. Edit and Save</h3>
                <p class="text-gray-600">
                  Fill in the form fields. Try entering invalid data to see
                  validation. Click "Save" to store your changes.
                </p>
              </div>

              <div>
                <h3 class="text-lg font-medium q-mb-sm">
                  5. Test Different Operations
                </h3>
                <p class="text-gray-600">
                  Try "Delete" to remove data, "Reset" to revert changes, or
                  change the key to work with different records.
                </p>
              </div>
            </div>
          </QCardSection>
        </QCard>
      </div>

      <!-- Event Log -->
      <div class="col-12">
        <QCard>
          <QCardSection>
            <h2 class="text-xl font-semibold q-mb-md">Event Log</h2>
            <div
              class="event-log bg-grey-1 p-3 rounded"
              style="max-height: 300px; overflow-y: auto"
            >
              <div
                v-for="(event, index) in eventLog"
                :key="index"
                class="q-mb-xs"
              >
                <span class="text-caption text-grey-6">{{
                  event.timestamp
                }}</span>
                <span class="q-ml-sm">{{ event.message }}</span>
              </div>
              <div v-if="eventLog.length === 0" class="text-grey-6">
                No events logged yet. Try interacting with the form above.
              </div>
            </div>
          </QCardSection>
        </QCard>
      </div>
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useQuasar } from "quasar";
import SchemaDataForm from "@/components/schemaform/SchemaDataForm.vue";
import SchemaApiForm from "@/components/schemaform/SchemaApiForm.vue";
import { DEFAULT_AVAILABLE_SCHEMAS } from "@/utils/schema-constants";

const $q = useQuasar();

// Event log for demonstration
interface EventLogItem {
  timestamp: string;
  message: string;
}

const eventLog = ref<EventLogItem[]>([]);

// Available schemas that match the backend registrations
const availableSchemas = [...DEFAULT_AVAILABLE_SCHEMAS];

// SchemaApiForm demo state
const selectedApiSchema = ref<string>("");
const apiFormInitialData = ref<Record<string, any>>({});
const apiSubmitButtonText = ref("Submit");
const apiSubmitButtonIcon = ref("send");
const apiResetButtonText = ref("Reset");
const apiResetButtonIcon = ref("refresh");
const apiClearButtonText = ref("Clear");
const apiClearButtonIcon = ref("clear_all");

const apiCompactMode = ref(false);
const apiColumns = ref(0); // 0=auto, 1=single column, 2=double column
const dataFormColumns = ref(0); // 0=auto, 1=single column, 2=double column

// Event handlers
const handleSave = (data: any) => {
  addEventLog(`✅ Data saved successfully: ${JSON.stringify(data, null, 2)}`);
  // Notification is handled by the AppDataForm component
};

const handleLoad = (data: any) => {
  if (data) {
    addEventLog(`📥 Data loaded: ${JSON.stringify(data, null, 2)}`);
  } else {
    addEventLog(
      `📥 No data found for the specified key - using default values`
    );
  }
};

const handleDelete = () => {
  addEventLog(`🗑️ Data deleted successfully`);
  // Notification is handled by the AppDataForm component
};

const handleCreate = (data: any) => {
  addEventLog(`✨ New data created: ${JSON.stringify(data, null, 2)}`);
  $q.notify({
    type: "positive",
    message: "New data created successfully!",
    position: "top",
  });
};

const handlePrepare = (data: any) => {
  addEventLog(
    `📝 Form prepared for new data: ${JSON.stringify(data, null, 2)}`
  );
  // No notification here as the component already shows its own info notification
};

const handleReset = (data: any) => {
  addEventLog(`🔄 Form reset to: ${JSON.stringify(data, null, 2)}`);
};

const handleSchemaChange = (schemaId: string) => {
  addEventLog(`📋 Schema changed to: ${schemaId}`);
};

const handleKeyChange = (key: number) => {
  addEventLog(`🔑 Data key changed to: ${key}`);
};

const handleDataFormColumnsChange = (value: number) => {
  addEventLog(`📐 Data form columns changed to: ${value}`);
};

// SchemaApiForm event handlers
const handleApiSchemaChange = (schemaId: string) => {
  addEventLog(`📋 API Form schema changed to: ${schemaId}`);
};

const resetApiForm = () => {
  apiFormInitialData.value = {};
  addEventLog(`🔄 API Form reset`);
};

const handleApiSubmit = (
  data: Record<string, any>,
  callback?: (success: boolean, message?: string) => void
) => {
  addEventLog(`🚀 API Form submitted: ${JSON.stringify(data, null, 2)}`);
  // Simulate API call delay
  setTimeout(() => {
    addEventLog(`✅ API call completed successfully`);
    // Call the callback to reset the submitting state
    if (callback) {
      callback(true, "API call completed successfully");
    }
  }, 1000);
};

const handleApiReset = (originalData: any) => {
  addEventLog(`🔄 API Form reset to: ${JSON.stringify(originalData, null, 2)}`);
};

const handleApiClear = () => {
  addEventLog(`🗑️ API Form cleared`);
};

const handleApiValidationError = (errors: Map<string, string>) => {
  const errorList = Array.from(errors.entries())
    .map(([field, error]) => `${field}: ${error}`)
    .join(", ");
  addEventLog(`⚠️ API Form validation errors: ${errorList}`);
};

const handleApiValidationSuccess = () => {
  addEventLog(`✅ API Form validation passed`);
};

const handleApiSchemaLoaded = (schema: any) => {
  addEventLog(`📋 API Form schema loaded: ${schema.title || "Untitled"}`);
};

const handleApiSchemaError = (error: string) => {
  addEventLog(`❌ API Form schema error: ${error}`);
};

// Helper function to add events to log
const addEventLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  eventLog.value.unshift({
    timestamp,
    message,
  });

  // Keep only the last 50 events
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50);
  }
};
</script>

<script lang="ts">
// Route metadata - automatically set showInMenu=true and order=4 via filename prefix 004.appdata-demo.vue
export const meta = {
  title: "AppData Demo",
  icon: "dashboard",
  description: "demo of the AppDataForm component",
};
</script>

<style scoped>
.event-log {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.85rem;
  line-height: 1.4;
}
</style>

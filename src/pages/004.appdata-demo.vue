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
        <SchemaDataForm
          title="Dynamic Data Form"
          description="Select a schema and data key to start editing"
          :available-schemas="availableSchemas"
          :auto-load="false"
          @save="handleSave"
          @load="handleLoad"
          @delete="handleDelete"
          @reset="handleReset"
          @create="handleCreate"
          @prepare="handlePrepare"
          @schema-change="handleSchemaChange"
          @key-change="handleKeyChange"
        />
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

const handleSchemaChange = (schemaName: string) => {
  addEventLog(`📋 Schema changed to: ${schemaName}`);
};

const handleKeyChange = (key: number) => {
  addEventLog(`🔑 Data key changed to: ${key}`);
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

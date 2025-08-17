<template>
  <QPage class="settings-page q-pa-lg">
    <div class="settings-container">
      <SchemaDataForm
        mode="config"
        :schema-id="schemaId"
        :show-diff-before-save="'toml'"
        :show-modification-indicator="true"
        :compact="true"
        @save="handleSave"
        @notify="handleNotify"
      />
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import SchemaDataForm from "@/components/schemaform/SchemaDataForm.vue";

const $q = useQuasar();
const schemaId = ref("AppConfig");

// Initialize schema id on mount
onMounted(() => {
  // Use fixed schema id for config
  schemaId.value = "AppConfig";
});

const handleSave = (_data: unknown) => {
  // Settings saved successfully
};

const handleNotify = ({ type, message }: { type: string; message: string }) => {
  $q.notify({
    type,
    message,
    position: "top",
  });
};
</script>

<style scoped>
.settings-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

<script lang="ts">
// Route metadata - automatically set showInMenu=true and order=998 via filename prefix 998.settings.vue
export const meta = {
  title: "Settings",
  icon: "settings",
  description: "configure application settings",
};
</script>

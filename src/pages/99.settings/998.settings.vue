<template>
  <QPage class="settings-page q-pa-lg">
    <div class="settings-container">
      <SchemaForm
        mode="config"
        :schema-name="schemaName"
        :show-diff-before-save="true"
        :show-modified-indicators="true"
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
import SchemaForm from "@/components/schemaform/SchemaForm.vue";

const $q = useQuasar();
const schemaName = ref("AppConfig");

// Initialize schema name on mount
onMounted(() => {
  // Use fixed schema name for config
  schemaName.value = "AppConfig";
});

const handleSave = (data: any) => {
  console.log("Settings saved:", data);
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

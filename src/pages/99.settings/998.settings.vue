<template>
  <ConfigEditor />
</template>

<script setup lang="ts">
import ConfigEditor from "@/components/ConfigEditor.vue";
</script>

<script lang="ts">
// Route metadata - automatically set showInMenu=true and order=998 via filename prefix 998.settings.vue
export const meta = {
  title: "Settings",
  icon: "settings",
  description: "configure application settings",
};
</script>

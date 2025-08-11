<template>
  <q-page
    class="flex column items-center justify-center"
    style="min-height: 100vh"
  >
    <div class="text-center">
      <h1 class="text-h3 q-mb-md">Welcome to CraftGUI</h1>
      <p class="text-body1 q-mb-lg">
        A desktop application built with Vue 3 + Quasar + Tauri
      </p>
      <q-btn color="primary" size="lg" @click="$router.push('/route-map')">
        Route Map
      </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Home page component logic
</script>

<script lang="ts">
// Route metadata - automatically set showInMenu=true and order=1 via filename prefix 001.index.vue
export const meta = {
  title: "Home",
  icon: "home",
  description: "welcome to CraftGUI",
};
</script>

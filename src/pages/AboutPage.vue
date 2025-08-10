<template>
  <q-page
    class="flex column items-center justify-center q-pa-md"
    style="min-height: 100vh"
  >
    <div class="text-center max-width-600">
      <h1 class="text-h3 q-mb-md">About CraftGUI</h1>
      <p class="text-body1 q-mb-lg">
        CraftGUI is a modern desktop application built with the following
        technology stack:
      </p>

      <div class="row q-gutter-md justify-center q-mb-lg">
        <q-card class="col-12 col-sm-6 col-md-4">
          <q-card-section>
            <div class="text-h6">Vue 3</div>
            <div class="text-caption">Progressive JavaScript Framework</div>
          </q-card-section>
        </q-card>

        <q-card class="col-12 col-sm-6 col-md-4">
          <q-card-section>
            <div class="text-h6">Quasar</div>
            <div class="text-caption">Material Design Framework for Vue.js</div>
          </q-card-section>
        </q-card>

        <q-card class="col-12 col-sm-6 col-md-4">
          <q-card-section>
            <div class="text-h6">Tauri</div>
            <div class="text-caption">Cross-platform Desktop App Framework</div>
          </q-card-section>
        </q-card>
      </div>

      <q-btn color="primary" @click="$router.push('/')"> Back to Home </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// About page component logic
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "About",
  icon: "info",
  showInMenu: true,
  description: "Learn more about CraftGUI",
  order: 4,
};
</script>

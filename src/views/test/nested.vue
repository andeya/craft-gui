<template>
  <q-page class="q-pa-md">
    <div class="text-center q-mb-lg">
      <h1 class="text-h3">Nested Route Test</h1>
      <p class="text-body1">
        This page tests nested subdirectory routing functionality
      </p>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Current Route Information</div>
        <div class="text-body1">Path: {{ $route.path }}</div>
        <div class="text-body1">Name: {{ $route.name }}</div>
        <div class="text-body1">File: src/views/test/nested.vue</div>
      </q-card-section>
    </q-card>

    <div class="q-mt-md">
      <q-btn color="primary" @click="$router.push('/')"> Back to Home </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Test component logic
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "Nested Test",
  icon: "folder",
  showInMenu: true,
  description: "Test nested subdirectory routing",
  order: 999,
};
</script>

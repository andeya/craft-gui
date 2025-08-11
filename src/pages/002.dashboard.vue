<template>
  <q-page class="q-pa-md">
    <div class="text-center q-mb-lg">
      <h1 class="text-h3">Dashboard</h1>
      <p class="text-body1">
        Welcome to your dashboard with auto-generated metadata
      </p>
    </div>

    <div class="row q-gutter-md">
      <q-card class="col-12 col-sm-6 col-md-4">
        <q-card-section>
          <div class="text-h6">Statistics</div>
          <div class="text-h4 text-primary">1,234</div>
          <div class="text-caption">Total Users</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-4">
        <q-card-section>
          <div class="text-h6">Revenue</div>
          <div class="text-h4 text-positive">$12,345</div>
          <div class="text-caption">Monthly Revenue</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-4">
        <q-card-section>
          <div class="text-h6">Growth</div>
          <div class="text-h4 text-warning">+15%</div>
          <div class="text-caption">Monthly Growth</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="q-mt-md">
      <q-btn color="primary" @click="$router.push('/')"> Back to Home </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Dashboard component logic
</script>

<script lang="ts">
// Route metadata - automatically set showInMenu=true and order=2 via filename prefix 002.dashboard.vue
export const meta = {
  title: "Dashboard",
  icon: "dashboard",
  description: "view application statistics and metrics",
};
</script>

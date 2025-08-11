<template>
  <q-page class="q-pa-md">
    <div class="text-center q-mb-lg">
      <h1 class="text-h3">Admin Dashboard</h1>
      <p class="text-body1">Welcome to the admin panel</p>
    </div>

    <div class="row q-gutter-md">
      <q-card class="col-12 col-sm-6 col-md-4">
        <q-card-section>
          <div class="text-h6">User Management</div>
          <div class="text-h4 text-primary">256</div>
          <div class="text-caption">Total Users</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-4">
        <q-card-section>
          <div class="text-h6">System Status</div>
          <div class="text-h4 text-positive">Online</div>
          <div class="text-caption">All systems operational</div>
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6 col-md-4">
        <q-card-section>
          <div class="text-h6">Recent Activity</div>
          <div class="text-h4 text-warning">23</div>
          <div class="text-caption">New activities today</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="q-mt-md">
      <q-btn color="primary" @click="$router.push('/')"> Back to Home </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Admin dashboard component logic
</script>

<script lang="ts">
// Route metadata - automatically set showInMenu=true and order=10 via filename prefix 010.admin-home.vue
export const meta = {
  title: "Admin Dashboard",
  icon: "admin_panel_settings",
  description: "Administrative dashboard and controls",
};
</script>

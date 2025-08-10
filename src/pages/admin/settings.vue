<template>
  <q-page class="q-pa-md">
    <div class="text-center q-mb-lg">
      <h1 class="text-h3">Admin Settings</h1>
      <p class="text-body1">Configure system-wide settings and preferences</p>
    </div>

    <div class="row q-gutter-md">
      <q-card class="col-12 col-sm-6">
        <q-card-section>
          <div class="text-h6">System Configuration</div>
          <q-toggle
            v-model="systemConfig.maintenance"
            label="Maintenance Mode"
          />
          <q-toggle v-model="systemConfig.debug" label="Debug Mode" />
          <q-toggle
            v-model="systemConfig.notifications"
            label="System Notifications"
          />
        </q-card-section>
      </q-card>

      <q-card class="col-12 col-sm-6">
        <q-card-section>
          <div class="text-h6">Security Settings</div>
          <q-toggle
            v-model="securityConfig.twoFactor"
            label="Two-Factor Authentication"
          />
          <q-toggle v-model="securityConfig.auditLog" label="Audit Logging" />
          <q-toggle
            v-model="securityConfig.sessionTimeout"
            label="Session Timeout"
          />
        </q-card-section>
      </q-card>
    </div>

    <div class="q-mt-md">
      <q-btn color="primary" @click="$router.push('/admin')">
        Back to Admin
      </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";

// System configuration
const systemConfig = ref({
  maintenance: false,
  debug: true,
  notifications: true,
});

// Security configuration
const securityConfig = ref({
  twoFactor: true,
  auditLog: true,
  sessionTimeout: false,
});
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "Admin Settings",
  icon: "admin_panel_settings",
  showInMenu: true,
  description: "Configure system-wide settings",
  order: 12,
};
</script>

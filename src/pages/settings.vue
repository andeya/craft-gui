<template>
  <q-page
    class="flex column items-center justify-center q-pa-md"
    style="min-height: 100vh"
  >
    <div class="text-center max-width-600">
      <h1 class="text-h3 q-mb-md">Application Settings</h1>
      <p class="text-body1 q-mb-lg">
        Configure various application settings here
      </p>

      <div class="row q-gutter-md justify-center q-mb-lg">
        <q-card class="col-12 col-sm-6">
          <q-card-section>
            <div class="text-h6">Theme Settings</div>
            <q-toggle v-model="darkMode" label="Dark Mode" />
          </q-card-section>
        </q-card>

        <q-card class="col-12 col-sm-6">
          <q-card-section>
            <div class="text-h6">Notification Settings</div>
            <q-toggle v-model="notifications" label="Enable Notifications" />
          </q-card-section>
        </q-card>
      </div>

      <q-btn color="primary" @click="$router.push('/')"> Back to Home </q-btn>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";

// Settings state
const darkMode = ref(false);
const notifications = ref(true);
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "Settings",
  icon: "settings",
  showInMenu: true,
  description: "Configure application settings",
  order: 5,
};
</script>

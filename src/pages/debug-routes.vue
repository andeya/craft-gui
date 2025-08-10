<template>
  <q-page class="q-pa-md">
    <div class="text-center q-mb-lg">
      <h1 class="text-h3">Route Debug Information</h1>
      <p class="text-body1">
        Display auto-generated route configuration information
      </p>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Current Route Information</div>
        <pre class="bg-grey-2 q-pa-sm rounded">{{
          JSON.stringify(currentRoute, null, 2)
        }}</pre>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">All Route Configurations</div>
        <pre class="bg-grey-2 q-pa-sm rounded">{{
          JSON.stringify(allRoutes, null, 2)
        }}</pre>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Menu Items</div>
        <pre class="bg-grey-2 q-pa-sm rounded">{{
          JSON.stringify(menuItems, null, 2)
        }}</pre>
      </q-card-section>
    </q-card>

    <q-btn color="primary" @click="$router.push('/')"> Back to Home </q-btn>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { getRouteConfig, generateMenuItems } from "../utils/auto-routes";

const route = useRoute();

// Current route information
const currentRoute = computed(() => ({
  path: route.path,
  name: route.name,
  meta: route.meta,
  params: route.params,
  query: route.query,
}));

// Debug data
const allRoutes = getRouteConfig();
const menuItems = generateMenuItems();
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "Route Debug",
  icon: "bug_report",
  showInMenu: false, // Hidden from menu
  description: "Debug route configuration",
  order: 999,
};
</script>

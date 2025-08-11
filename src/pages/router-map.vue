<template>
  <q-page class="q-pa-md">
    <!-- Current Route Information -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Current Route Information</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>Path</q-item-label>
              <q-item-label caption>{{ currentPath }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Title</q-item-label>
              <q-item-label caption>{{ currentRouteTitle }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Icon</q-item-label>
              <q-item-label caption>{{ currentRouteIcon }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Name</q-item-label>
              <q-item-label caption>{{ currentRouteName }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Navigation Controls -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Navigation Controls</div>
        <div class="row q-gutter-sm">
          <q-btn color="primary" @click="goBack" icon="arrow_back">
            Back
          </q-btn>
          <q-btn color="primary" @click="goForward" icon="arrow_forward">
            Forward
          </q-btn>
          <q-btn color="secondary" @click="goTo('/')" icon="home"> Home </q-btn>
          <q-btn
            color="secondary"
            @click="goTo('/admin')"
            icon="admin_panel_settings"
          >
            Admin
          </q-btn>
        </div>
      </q-card-section>
    </q-card>

    <!-- Route Statistics -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Route Statistics</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>Total Routes</q-item-label>
              <q-item-label caption>{{ allRoutes.length }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Menu Routes</q-item-label>
              <q-item-label caption>{{ menuRoutes.length }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Admin Routes</q-item-label>
              <q-item-label caption>{{ adminRoutes.length }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Depth 1 Routes</q-item-label>
              <q-item-label caption>{{ depth1Routes.length }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Route Lists -->
    <div class="row q-gutter-md">
      <!-- All Routes -->
      <q-card class="col-12 col-md-6">
        <q-card-section>
          <div class="text-h6">All Routes</div>
          <q-list dense>
            <q-item
              v-for="route in allRoutes"
              :key="route.path"
              clickable
              @click="goTo(route.path)"
            >
              <q-item-section avatar>
                <q-icon :name="getRouteIcon(route)" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getRouteTitle(route) }}</q-item-label>
                <q-item-label caption>{{ route.path }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Admin Routes -->
      <q-card class="col-12 col-md-6">
        <q-card-section>
          <div class="text-h6">Admin Routes</div>
          <q-list dense>
            <q-item
              v-for="route in adminRoutes"
              :key="route.path"
              clickable
              @click="goTo(route.path)"
            >
              <q-item-section avatar>
                <q-icon :name="getRouteIcon(route)" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ getRouteTitle(route) }}</q-item-label>
                <q-item-label caption>{{ route.path }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Route Testing -->
    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Route Testing</div>
        <div class="row q-gutter-sm q-mb-md">
          <q-input
            v-model="testPath"
            label="Test Path"
            dense
            outlined
            class="col-12 col-md-4"
          />
          <q-btn color="primary" @click="testRoute" label="Test Route" />
        </div>
        <div v-if="testResult" class="text-body2">
          <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGlobalRouter } from "../composables/useGlobalRouter";

// Use global router composable
const {
  currentPath,
  currentRouteTitle,
  currentRouteIcon,
  currentRouteName,
  allRoutes,
  menuRoutes,
  adminRoutes,
  depth1Routes,
  goTo,
  goBack,
  goForward,
  findRouteByPath,
  checkRouteExists,
} = useGlobalRouter();

// Test route functionality
const testPath = ref("/admin");
const testResult = ref<any>(null);

// Helper functions for template
function getRouteTitle(route: any) {
  return route.meta?.title || route.name || "Untitled";
}

function getRouteIcon(route: any) {
  return route.meta?.icon || "article";
}

function testRoute() {
  const route = findRouteByPath(testPath.value);
  const exists = checkRouteExists(testPath.value);

  testResult.value = {
    path: testPath.value,
    exists,
    route: route
      ? {
          path: route.path,
          name: route.name,
          meta: route.meta,
        }
      : null,
  };
}
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "Router Map",
  icon: "router",
  showInMenu: true,
  description: "Global router utilities",
  order: 1000,
};
</script>

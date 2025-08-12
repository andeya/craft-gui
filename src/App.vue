<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useQuasar } from "quasar";
import { initializeRouteManager } from "./composables/useRouteManager";
import { useCurrentRoute } from "./composables/useCurrentRoute";
import { useNavigation } from "./composables/useNavigation";
import { useGlobalState } from "./composables/useGlobalState";
import { setPageTitle } from "./utils/app-config";
import { RouteMeta } from "./types/route-meta";

const $q = useQuasar();

// Whether it is desktop mode (screen width greater than or equal to 1024px)
const isDesktop = computed(() => $q.screen.gt.md);

const leftDrawerOpen = ref(isDesktop.value);

// Initialize route manager once
const { menuRoutes } = initializeRouteManager();

// Get current route state (must be in setup function)
const { currentRoute } = useCurrentRoute();

// Get navigation methods (must be in setup function)
const { goTo } = useNavigation();

// Initialize global state management
useGlobalState();

// Watch for route changes and update page title
watch(
  () => currentRoute.value.title,
  (newTitle) => {
    setPageTitle(newTitle);
  },
  { immediate: true }
);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function navigateTo(path: string) {
  // Use global router navigation
  goTo(path);
  // Keep left drawer open on desktop, close on mobile
  leftDrawerOpen.value = isDesktop.value;
}

// Check if current route is active
function isActive(path: string) {
  return currentRoute.value.path === path;
}

// Show console access information
console.log("🌐 Global Router Object Available: $router");
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-white">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
        />

        <q-toolbar-title>
          <span class="text-lg font-bold">{{ currentRoute.title }}</span>
          <span class="text-sm text-secondary text-white ml-2">{{
            currentRoute?.meta?.description
          }}</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
      <q-list>
        <q-item-label header> Navigation Menu </q-item-label>

        <q-item
          v-for="item in menuRoutes"
          :key="item.path"
          clickable
          :active="isActive(item.path)"
          @click="navigateTo(item.path)"
        >
          <q-item-section avatar>
            <q-icon :name="RouteMeta.getIconName(item.meta)" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ RouteMeta.getTitle(item.meta) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header> External Links </q-item-label>

        <q-item
          clickable
          target="_blank"
          rel="noopener"
          href="https://quasar.dev"
        >
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Quasar Documentation</q-item-label>
            <q-item-label caption>quasar.dev</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          target="_blank"
          rel="noopener"
          href="https://tauri.app"
        >
          <q-item-section avatar>
            <q-icon name="desktop_windows" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Tauri Official</q-item-label>
            <q-item-label caption>tauri.app</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

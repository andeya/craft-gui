<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { generateMenuItems } from "./utils/auto-routes";

const route = useRoute();
const router = useRouter();
const leftDrawerOpen = ref(false);

// Compute current page title
const pageTitle = computed(() => {
  return route.meta?.title || "Ksool";
});

// Auto-generate navigation menu items
const menuItems = generateMenuItems();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function navigateTo(path: string) {
  router.push(path);
  leftDrawerOpen.value = false; // Close drawer after navigation
}

// Check if current route is active
function isActive(path: string) {
  return route.path === path;
}
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

        <q-toolbar-title>{{ pageTitle }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
      <q-list>
        <q-item-label header> Navigation Menu </q-item-label>

        <q-item
          v-for="item in menuItems"
          :key="item.path"
          clickable
          :active="isActive(item.path)"
          @click="navigateTo(item.path)"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
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

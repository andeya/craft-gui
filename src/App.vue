<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import { router, menuRouteGroupInfos } from "@/router/auto-routes";

const $q = useQuasar();

// Whether it is desktop mode (screen width greater than or equal to 1024px)
const isDesktop = computed(() => $q.screen.gt.md);

const leftDrawerOpen = ref(isDesktop.value);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const currentRoute = useRoute();

function navigateTo(path: string) {
  // Use global router navigation
  router.push(path);
  // Keep left drawer open on desktop, close on mobile
  leftDrawerOpen.value = isDesktop.value;
}

// Check if current route is active
function isActive(path: string) {
  return currentRoute.path === path;
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

        <q-toolbar-title>
          <span class="text-lg font-bold">{{ currentRoute.meta.title }}</span>
          <span class="text-sm text-secondary text-white ml-2">{{
            currentRoute?.meta?.description
          }}</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
      <q-list v-for="group in menuRouteGroupInfos" :key="group.title">
        <q-item-label header> {{ group.title }} </q-item-label>

        <q-item
          v-for="item in group.routes"
          :key="item.path"
          clickable
          :active="isActive(item.path)"
          @click="navigateTo(item.path)"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.title }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator class="q-my-md" />
      </q-list>

      <q-item-label header>▶:::::::::◀</q-item-label>
      <!-- <q-item-label header>⧸::::::::::⧹</q-item-label> -->

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

      <q-item clickable target="_blank" rel="noopener" href="https://tauri.app">
        <q-item-section avatar>
          <q-icon name="desktop_windows" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Tauri Official</q-item-label>
          <q-item-label caption>tauri.app</q-item-label>
        </q-item-section>
      </q-item>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

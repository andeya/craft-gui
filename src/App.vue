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
  <QLayout view="lHh Lpr lFf" class="bg-white">
    <QHeader elevated>
      <QToolbar>
        <QBtn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
        />

        <QToolbarTitle>
          <span class="text-lg font-bold">{{ currentRoute.meta.title }}</span>
          <span class="text-sm text-secondary text-white ml-2">{{
            currentRoute?.meta?.description
          }}</span>
        </QToolbarTitle>
      </QToolbar>
    </QHeader>

    <QDrawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
      <QList v-for="group in menuRouteGroupInfos" :key="group.title">
        <QItemLabel header> {{ group.title }} </QItemLabel>

        <QItem
          v-for="item in group.routes"
          :key="item.path"
          clickable
          :active="isActive(item.path)"
          @click="navigateTo(item.path)"
        >
          <QItemSection avatar>
            <QIcon :name="item.icon" />
          </QItemSection>
          <QItemSection>
            <QItemLabel>{{ item.title }}</QItemLabel>
          </QItemSection>
        </QItem>

        <QSeparator class="q-my-md" />
      </QList>

      <QItemLabel header>▶:::::::::◀</QItemLabel>
      <!-- <QItemLabel header>⧸::::::::::⧹</QItemLabel> -->

      <QItem
        clickable
        target="_blank"
        rel="noopener"
        href="https://quasar.dev"
      >
        <QItemSection avatar>
          <QIcon name="school" />
        </QItemSection>
        <QItemSection>
          <QItemLabel>Quasar Documentation</QItemLabel>
          <QItemLabel caption>quasar.dev</QItemLabel>
        </QItemSection>
      </QItem>

      <QItem clickable target="_blank" rel="noopener" href="https://tauri.app">
        <QItemSection avatar>
          <QIcon name="desktop_windows" />
        </QItemSection>
        <QItemSection>
          <QItemLabel>Tauri Official</QItemLabel>
          <QItemLabel caption>tauri.app</QItemLabel>
        </QItemSection>
      </QItem>
    </QDrawer>

    <QPageContainer>
      <router-view />
    </QPageContainer>
  </QLayout>
</template>

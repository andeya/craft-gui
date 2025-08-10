<template>
  <q-page class="flex column items-center" style="min-height: 100vh">
    <div
      class="w-full max-w-lg q-pa-md px-2"
      style="padding-top: 24vh; margin: 0 auto"
    >
      <div class="text-h4 md:text-h3 text-center q-mb-md">
        {{ meta.description }}
      </div>
      <div
        class="flex justify-center items-center gap-4 md:gap-12 q-mb-md flex-wrap w-full max-w-lg mx-auto"
      >
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://vuejs.org/" target="_blank">
          <img src="../assets/vue.svg" class="logo vue" alt="Vue logo" />
        </a>
      </div>
      <div class="text-center q-mb-lg">
        Click on the Tauri, Vite, and Vue logos to learn more.
      </div>
      <div class="w-full">
        <q-form
          @submit.prevent="greet"
          class="flex gap-x-1 items-center"
          style="max-width: 80%; margin: 0 auto"
        >
          <q-input
            v-model="name"
            label="Enter a name..."
            dense
            outlined
            id="greet-input"
            class="flex-1"
            style="min-width: 120px; max-width: 100%"
          />
          <q-btn type="submit" color="black" unelevated> GREET </q-btn>
        </q-form>
      </div>
      <div class="q-mt-md text-center">{{ greetMsg }}</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";

const greetMsg = ref("");
const name = ref("");

async function greet() {
  greetMsg.value = await invoke("greet", { name: name.value });
}
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "Rust Call",
  icon: "api",
  showInMenu: true,
  description: "Test Call Rust Function",
  order: 3,
};
</script>

<style scoped>
.logo {
  width: 6em;
  height: 6em;
  padding: 1.2em;
  will-change: filter;
  transition: 0.75s;
  max-width: unset;
  max-height: unset;
}
@media (min-width: 768px) {
  .logo {
    width: 9em;
    height: 9em;
    padding: 1.5em;
  }
}
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}
.logo.tauri:hover {
  filter: drop-shadow(0 0 2em #24c8db);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}
</style>

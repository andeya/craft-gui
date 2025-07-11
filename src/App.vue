<script setup lang="ts">
import Hello from "./components/Hello.vue";
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
      <Hello />
    </q-page-container>
  </q-layout>
</template>

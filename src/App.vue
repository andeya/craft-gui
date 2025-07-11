<script setup lang="ts">
import Hello from "./components/Hello.vue";
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 头部、侧边栏等可选 -->
    <q-page-container>
      <router-view />
      <Hello />
    </q-page-container>
  </q-layout>
</template>

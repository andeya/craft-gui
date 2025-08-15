<template>
  <QPage
    class="flex column items-center justify-center"
    style="min-height: 100vh"
  >
    <div class="text-center">
      <h1 class="text-h3 q-mb-md">Hidden Page</h1>
      <p class="text-body1 q-mb-lg">
        This page will not appear in the menu because the filename has no
        numeric prefix (showInMenu: false, order: 0)
      </p>
      <QBtn color="primary" size="lg" @click="$router.push('/')">
        Back to Home
      </QBtn>
    </div>
  </QPage>
</template>

<script setup lang="ts">
// Hidden page component logic
</script>

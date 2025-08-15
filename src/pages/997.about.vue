<template>
  <QPage class="q-pa-lg">
    <div class="max-width-800 mx-auto">
      <!-- README Content -->
      <div class="markdown-body" v-html="renderedReadme"></div>

      <!-- Navigation -->
      <div class="text-center q-mt-lg">
        <QBtn color="primary" size="lg" @click="$router.push('/')">
          Back to Home
        </QBtn>
      </div>
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import { readmeContent } from "virtual:readme-content";
import "github-markdown-css";

// Configure marked options for GitHub-style rendering
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert line breaks to <br>
});

// Render markdown to HTML
const renderedReadme = computed(() => marked(readmeContent));
</script>

<script lang="ts">
// Route metadata - these will be overridden by filename prefix
export const meta = {
  title: "About",
  icon: "info",
  description: "the project description",
};
</script>

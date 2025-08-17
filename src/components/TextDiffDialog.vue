<template>
  <QDialog
    ref="dialogRef"
    v-model="isVisible"
    :persistent="persistent"
    :maximized="maximized"
    :full-width="fullWidth"
    :full-height="fullHeight"
    @hide="onDialogHide"
  >
    <QCard class="q-dialog-plugin">
      <QCardSection>
        <div class="text-diff-dialog">
          <div class="diff-header">
            <div class="diff-title">
              {{ hasChanges ? "⚠️ Changes Detected" : "✓ No Changes" }}
            </div>
            <div class="diff-subtitle">
              {{
                subtitle ||
                "Review the differences between current and original data"
              }}
            </div>
          </div>

          <div class="diff-content">
            <div v-if="hasChanges" class="diff-section">
              <div class="diff-section-content">
                <div class="diff-changes">
                  <div
                    v-for="(change, index) in diffChanges"
                    :key="index"
                    :class="['diff-line', `diff-${change.type}`]"
                  >
                    <span class="diff-line-number">{{
                      change.lineNumber
                    }}</span>
                    <span class="diff-line-content">{{ change.content }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="diff-section">
              <div class="diff-section-header">
                <span class="diff-label">No Changes</span>
              </div>
              <div class="diff-section-content">
                <div class="diff-no-changes">
                  <p>{{ noChangesMessage || "No changes detected." }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </QCardSection>

      <QCardActions align="right">
        <QBtn
          :color="confirmButtonColor"
          :label="confirmButtonLabel"
          @click="onOKClick"
        />
        <QBtn
          :color="cancelButtonColor"
          :label="cancelButtonLabel"
          @click="onCancelClick"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import * as diff from "diff";

interface DiffChange {
  type: "added" | "removed" | "unchanged";
  lineNumber: string;
  content: string;
}

interface Props {
  // Text to compare - direct string values
  currentText: string;
  originalText: string;

  // UI customization
  title?: string;
  subtitle?: string;
  noChangesMessage?: string;

  // Button customization
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;

  // Dialog behavior
  persistent?: boolean;
  maximized?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;

  // Dialog visibility
  modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Text Comparison",
  subtitle: "Review the differences between current and original text",
  noChangesMessage: "No changes detected.",
  confirmButtonLabel: "Confirm",
  cancelButtonLabel: "Cancel",
  confirmButtonColor: "primary",
  cancelButtonColor: "secondary",
  persistent: true,
  maximized: false,
  fullWidth: true, // Use full width for diff dialog
  fullHeight: false,
  modelValue: false,
});

const emit = defineEmits<{
  "update:model-value": [value: boolean];
  ok: [];
  cancel: [];
  hide: [];
}>();

// Dialog state
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:model-value", value),
});

const dialogRef = ref();

const hasChanges = computed(() => {
  return props.currentText !== props.originalText;
});

const diffChanges = computed(() => {
  if (!hasChanges.value) return [];

  const changes: DiffChange[] = [];
  const diffResult = diff.diffLines(props.originalText, props.currentText, {
    ignoreWhitespace: false,
    newlineIsToken: true,
  });

  let lineNumber = 1;

  diffResult.forEach((part) => {
    const lines = part.value.split("\n");

    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === "") return; // Skip empty last line

      const type: "added" | "removed" | "unchanged" = part.added
        ? "added"
        : part.removed
        ? "removed"
        : "unchanged";

      const lineNumberSymbol =
        type === "added" ? "+" : type === "removed" ? "-" : " ";
      changes.push({
        type,
        lineNumber: lineNumberSymbol,
        content: line,
      });

      if (type !== "removed") {
        lineNumber++;
      }
    });
  });

  return changes;
});

// Dialog methods
function show() {
  isVisible.value = true;
}

function hide() {
  isVisible.value = false;
}

// Event handlers
function onOKClick() {
  emit("ok");
  hide();
}

function onCancelClick() {
  emit("cancel");
  hide();
}

function onDialogHide() {
  emit("hide");
}

// Expose methods for external use
defineExpose({
  show,
  hide,
});
</script>

<style scoped>
.text-diff-dialog {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.875rem;
  line-height: 1.4;
  width: 100%;
  min-width: 600px; /* Minimum content width */
}

.diff-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.diff-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.diff-subtitle {
  color: #666;
  font-size: 0.875rem;
}

.diff-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.diff-section {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.diff-section-header {
  background-color: #f8f9fa;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.diff-label {
  font-weight: 600;
  color: #333;
}

.diff-section-content {
  max-height: 60vh;
  overflow-y: auto;
  width: 100%;
}

.diff-changes {
  padding: 0.75rem;
  background-color: #f8f9fa;
  width: 100%;
  min-width: 0;
}

.diff-no-changes {
  padding: 1rem;
  text-align: center;
  color: #666;
}

.diff-line {
  display: flex;
  align-items: flex-start;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
  width: 100%;
  min-width: 0;
}

.diff-line-number {
  flex-shrink: 0;
  width: 2rem;
  text-align: center;
  font-weight: 600;
  margin-right: 0.5rem;
  user-select: none;
}

.diff-line-content {
  flex: 1;
  min-width: 0;
}

.diff-added {
  background-color: #e6ffed;
  color: #22863a;
}

.diff-added .diff-line-number {
  color: #28a745;
}

.diff-removed {
  background-color: #ffeef0;
  color: #cb2431;
}

.diff-removed .diff-line-number {
  color: #d73a49;
}

.diff-unchanged {
  color: #24292e;
}

.diff-unchanged .diff-line-number {
  color: #6a737d;
}
</style>

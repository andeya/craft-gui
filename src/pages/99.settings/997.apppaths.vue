<template>
  <QPage class="apppaths-page q-pa-lg">
    <div class="apppaths-container">
      <!-- Page Header -->
      <QCard class="q-mb-lg">
        <QCardSection>
          <div class="row items-center">
            <QIcon name="folder" size="2rem" color="primary" class="q-mr-md" />
            <div>
              <h1 class="text-h4 q-mb-xs">Application Paths</h1>
              <p class="text-body2 text-grey-6 q-mb-none">
                System and application directory paths resolved by Tauri
              </p>
            </div>
          </div>
        </QCardSection>
      </QCard>

      <!-- Loading State -->
      <QCard v-if="loading" class="q-mb-md">
        <QCardSection class="text-center q-pa-lg">
          <QSpinner color="primary" size="2rem" />
          <div class="text-body1 q-mt-md">Loading path information...</div>
        </QCardSection>
      </QCard>

      <!-- Error State -->
      <QCard v-else-if="error" class="q-mb-md bg-negative text-white">
        <QCardSection>
          <div class="row items-start q-col-gutter-sm">
            <QIcon name="error" size="1.5rem" class="q-mt-xs" />
            <div class="col">
              <div class="text-h6">Failed to Load Paths</div>
              <div class="text-body2">{{ error }}</div>
            </div>
          </div>
        </QCardSection>
      </QCard>

      <!-- Path Categories -->
      <div v-else-if="pathCategories.length > 0" class="row q-col-gutter-md">
        <div
          v-for="category in pathCategories"
          :key="category.name"
          class="col-12 col-md-6 col-lg-4"
        >
          <QCard class="path-category-card">
            <QCardSection>
              <div class="row items-center q-mb-md">
                <QIcon
                  :name="category.icon"
                  :color="category.color"
                  size="1.5rem"
                  class="q-mr-sm"
                />
                <div>
                  <h3 class="text-h6 q-mb-xs">{{ category.name }}</h3>
                  <p class="text-caption text-grey-6 q-mb-none">
                    {{ category.description }}
                  </p>
                </div>
              </div>

              <div class="q-gutter-y-sm">
                <div
                  v-for="path in category.paths"
                  :key="path.key"
                  class="path-item"
                >
                  <div class="path-header">
                    <div class="path-label">{{ path.label }}</div>
                    <QBtn
                      v-if="isValidPath(path.value)"
                      flat
                      round
                      dense
                      icon="content_copy"
                      size="sm"
                      color="grey-6"
                      @click="copyPathToClipboard(path.value)"
                    >
                      <QTooltip>Copy path</QTooltip>
                    </QBtn>
                  </div>
                  <div
                    class="path-description text-caption text-grey-6 q-mb-xs"
                  >
                    {{ path.description }}
                  </div>
                  <div
                    class="path-value"
                    :class="{
                      'path-success': isValidPath(path.value),
                      'path-error': !isValidPath(path.value),
                    }"
                  >
                    <QIcon
                      :name="isValidPath(path.value) ? 'check_circle' : 'error'"
                      :color="isValidPath(path.value) ? 'positive' : 'negative'"
                      size="1rem"
                      class="q-mr-xs"
                    />
                    <span class="path-text">
                      {{ getPathValue(path.value) }}
                    </span>
                  </div>
                </div>
              </div>
            </QCardSection>
          </QCard>
        </div>
      </div>

      <!-- Summary Card -->
      <QCard v-if="pathCategories.length > 0" class="q-mt-lg">
        <QCardSection>
          <h3 class="text-h6 q-mb-md">Path Summary</h3>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <div class="summary-item">
                <div class="summary-number">{{ totalPaths }}</div>
                <div class="summary-label">Total Paths</div>
              </div>
            </div>
            <div class="col-12 col-md-3">
              <div class="summary-item">
                <div class="summary-number text-positive">{{ validPaths }}</div>
                <div class="summary-label">Valid Paths</div>
              </div>
            </div>
            <div class="col-12 col-md-3">
              <div class="summary-item">
                <div class="summary-number text-negative">{{ errorPaths }}</div>
                <div class="summary-label">Error Paths</div>
              </div>
            </div>
            <div class="col-12 col-md-3">
              <div class="summary-item">
                <div class="summary-number">{{ pathCategories.length }}</div>
                <div class="summary-label">Categories</div>
              </div>
            </div>
          </div>
        </QCardSection>
      </QCard>
    </div>
  </QPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useQuasar } from "quasar";
import { copyToClipboard } from "@/utils/clipboard";
import type { PathCategory, Result } from "@/types/path-resolver";

const $q = useQuasar();

// Reactive state
const loading = ref(true);
const error = ref("");
const pathData = ref<Record<string, Result<string, string>>>({});

// Load path data using Tauri path API
const loadPathData = async () => {
  try {
    loading.value = true;
    error.value = "";

    // Check if Tauri path API is available
    if (!window.__TAURI__?.path) {
      throw new Error("Tauri path API not available");
    }

    const pathApi = window.__TAURI__.path;
    const pathFunctions = [
      { key: "home_dir", fn: pathApi.homeDir },
      { key: "desktop_dir", fn: pathApi.desktopDir },
      { key: "document_dir", fn: pathApi.documentDir },
      { key: "download_dir", fn: pathApi.downloadDir },
      { key: "picture_dir", fn: pathApi.pictureDir },
      { key: "video_dir", fn: pathApi.videoDir },
      { key: "audio_dir", fn: pathApi.audioDir },
      { key: "public_dir", fn: pathApi.publicDir },
      { key: "template_dir", fn: pathApi.templateDir },
      { key: "app_config_dir", fn: pathApi.appConfigDir },
      { key: "app_data_dir", fn: pathApi.appDataDir },
      { key: "app_local_data_dir", fn: pathApi.appLocalDataDir },
      { key: "app_cache_dir", fn: pathApi.appCacheDir },
      { key: "app_log_dir", fn: pathApi.appLogDir },
      { key: "resource_dir", fn: pathApi.resourceDir },
      { key: "executable_dir", fn: pathApi.executableDir },
      { key: "cache_dir", fn: pathApi.cacheDir },
      { key: "local_data_dir", fn: pathApi.localDataDir },
      { key: "data_dir", fn: pathApi.dataDir },
      { key: "config_dir", fn: pathApi.configDir },
      { key: "runtime_dir", fn: pathApi.runtimeDir },
      { key: "temp_dir", fn: pathApi.tempDir },
      { key: "font_dir", fn: pathApi.fontDir },
    ];

    // Load all path data
    const results = await Promise.allSettled(
      pathFunctions.map(async ({ key, fn }) => {
        try {
          const path = await fn();
          return { key, result: { Ok: path } as Result<string, string> };
        } catch (err) {
          return {
            key,
            result: { Err: String(err) } as Result<string, string>,
          };
        }
      })
    );

    // Process results
    const newPathData: Record<string, Result<string, string>> = {};
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        newPathData[result.value.key] = result.value.result;
      }
    });

    pathData.value = newPathData;
  } catch (err) {
    error.value = `Failed to load path data: ${err}`;
    console.error("Error loading path data:", err);
  } finally {
    loading.value = false;
  }
};

// Helper function to check if a path is valid
const isValidPath = (path: Result<string, string>): boolean => {
  return path.Ok !== undefined;
};

// Helper function to get path value or error message
const getPathValue = (path: Result<string, string>): string => {
  if (path.Ok !== undefined) {
    return path.Ok;
  }
  return path.Err || "Unknown error";
};

// Copy path to clipboard
const copyPathToClipboard = async (path: Result<string, string>) => {
  const pathValue = getPathValue(path);
  const success = await copyToClipboard(pathValue);

  if (success) {
    $q.notify({
      type: "positive",
      message: "Path copied to clipboard",
      position: "top",
      timeout: 2000,
    });
  } else {
    $q.notify({
      type: "negative",
      message: "Failed to copy path",
      position: "top",
      timeout: 2000,
    });
  }
};

// Organize paths into categories
const pathCategories = computed((): PathCategory[] => {
  if (!pathData.value || Object.keys(pathData.value).length === 0) return [];

  return [
    {
      name: "System Directories",
      description: "Standard system directories",
      icon: "computer",
      color: "blue",
      paths: [
        {
          key: "home_dir",
          label: "Home Directory",
          description: "User's home directory",
          value: pathData.value.home_dir || { Err: "Not loaded" },
        },
        {
          key: "desktop_dir",
          label: "Desktop",
          description: "Desktop directory",
          value: pathData.value.desktop_dir || { Err: "Not loaded" },
        },
        {
          key: "document_dir",
          label: "Documents",
          description: "Documents directory",
          value: pathData.value.document_dir || { Err: "Not loaded" },
        },
        {
          key: "download_dir",
          label: "Downloads",
          description: "Downloads directory",
          value: pathData.value.download_dir || { Err: "Not loaded" },
        },
        {
          key: "picture_dir",
          label: "Pictures",
          description: "Pictures directory",
          value: pathData.value.picture_dir || { Err: "Not loaded" },
        },
        {
          key: "video_dir",
          label: "Videos",
          description: "Videos directory",
          value: pathData.value.video_dir || { Err: "Not loaded" },
        },
        {
          key: "audio_dir",
          label: "Audio",
          description: "Audio directory",
          value: pathData.value.audio_dir || { Err: "Not loaded" },
        },
        {
          key: "public_dir",
          label: "Public",
          description: "Public directory",
          value: pathData.value.public_dir || { Err: "Not loaded" },
        },
        {
          key: "template_dir",
          label: "Templates",
          description: "Templates directory",
          value: pathData.value.template_dir || { Err: "Not loaded" },
        },
      ],
    },
    {
      name: "Application Directories",
      description: "Application-specific directories",
      icon: "apps",
      color: "green",
      paths: [
        {
          key: "app_config_dir",
          label: "App Config",
          description: "Application configuration directory",
          value: pathData.value.app_config_dir || { Err: "Not loaded" },
        },
        {
          key: "app_data_dir",
          label: "App Data",
          description: "Application data directory",
          value: pathData.value.app_data_dir || { Err: "Not loaded" },
        },
        {
          key: "app_local_data_dir",
          label: "App Local Data",
          description: "Application local data directory",
          value: pathData.value.app_local_data_dir || { Err: "Not loaded" },
        },
        {
          key: "app_cache_dir",
          label: "App Cache",
          description: "Application cache directory",
          value: pathData.value.app_cache_dir || { Err: "Not loaded" },
        },
        {
          key: "app_log_dir",
          label: "App Logs",
          description: "Application log directory",
          value: pathData.value.app_log_dir || { Err: "Not loaded" },
        },
        {
          key: "resource_dir",
          label: "Resources",
          description: "Application resources directory",
          value: pathData.value.resource_dir || { Err: "Not loaded" },
        },
        {
          key: "executable_dir",
          label: "Executable",
          description: "Application executable directory",
          value: pathData.value.executable_dir || { Err: "Not loaded" },
        },
      ],
    },
    {
      name: "System Cache & Temp",
      description: "System cache and temporary directories",
      icon: "storage",
      color: "orange",
      paths: [
        {
          key: "cache_dir",
          label: "Cache",
          description: "System cache directory",
          value: pathData.value.cache_dir || { Err: "Not loaded" },
        },
        {
          key: "local_data_dir",
          label: "Local Data",
          description: "Local data directory",
          value: pathData.value.local_data_dir || { Err: "Not loaded" },
        },
        {
          key: "data_dir",
          label: "Data",
          description: "Data directory",
          value: pathData.value.data_dir || { Err: "Not loaded" },
        },
        {
          key: "config_dir",
          label: "Config",
          description: "Configuration directory",
          value: pathData.value.config_dir || { Err: "Not loaded" },
        },
        {
          key: "runtime_dir",
          label: "Runtime",
          description: "Runtime directory",
          value: pathData.value.runtime_dir || { Err: "Not loaded" },
        },
        {
          key: "temp_dir",
          label: "Temp",
          description: "Temporary directory",
          value: pathData.value.temp_dir || { Err: "Not loaded" },
        },
        {
          key: "font_dir",
          label: "Fonts",
          description: "Font directory",
          value: pathData.value.font_dir || { Err: "Not loaded" },
        },
      ],
    },
  ];
});

// Summary statistics
const totalPaths = computed(() => {
  return pathCategories.value.reduce(
    (total, category) => total + category.paths.length,
    0
  );
});

const validPaths = computed(() => {
  return pathCategories.value.reduce((total, category) => {
    return (
      total + category.paths.filter((path) => isValidPath(path.value)).length
    );
  }, 0);
});

const errorPaths = computed(() => {
  return totalPaths.value - validPaths.value;
});

// Load data on mount
onMounted(() => {
  loadPathData();
});
</script>

<script lang="ts">
// Route metadata - automatically set showInMenu=true and order=997 via filename prefix 997.apppaths.vue
export const meta = {
  title: "App Paths",
  icon: "folder",
  description: "view application and system paths",
};
</script>

<style scoped>
.apppaths-container {
  max-width: 1400px;
  margin: 0 auto;
}

.path-category-card {
  height: 100%;
  transition: all 0.3s ease;
}

.path-category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.path-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.path-item:last-child {
  border-bottom: none;
}

.path-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.path-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.path-description {
  font-size: 0.75rem;
  line-height: 1.2;
}

.path-value {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.8rem;
  word-break: break-all;
  line-height: 1.3;
}

.path-success {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.path-error {
  background-color: #ffebee;
  color: #c62828;
}

.path-text {
  flex: 1;
}

.summary-item {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.summary-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>

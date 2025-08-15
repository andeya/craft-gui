import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "fs";
import { join } from "path";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
  },
  plugins: [
    {
      name: "readme-loader",
      resolveId(id) {
        if (id === "virtual:readme-content") {
          return id;
        }
      },
      load(id) {
        if (id === "virtual:readme-content") {
          try {
            const readmePath = join(process.cwd(), "README.md");
            const content = readFileSync(readmePath, "utf-8");
            return `export const readmeContent = ${JSON.stringify(content)};`;
          } catch (error) {
            console.warn("Failed to load README.md:", error);
            return `export const readmeContent = ${JSON.stringify(
              "# README.md not found\n\nPlease ensure README.md exists in the project root."
            )};`;
          }
        }
      },
    },
    vue({
      template: { transformAssetUrls },
    }),
    // @quasar/plugin-vite options list:
    // https://github.com/quasarframework/quasar/blob/dev/vite-plugin/index.d.ts
    quasar({
      sassVariables: fileURLToPath(
        new URL("./src/quasar-variables.sass", import.meta.url)
      ),
      autoImportComponentCase: "pascal",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
});

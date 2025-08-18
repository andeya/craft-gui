/**
 * Tauri API type definitions
 * Global type declarations for Tauri v2 APIs
 */

declare global {
  interface Window {
    __TAURI__?: {
      clipboardManager?: {
        writeText: (text: string) => Promise<void>;
        readText: () => Promise<string>;
      };
      path?: {
        homeDir: () => Promise<string>;
        desktopDir: () => Promise<string>;
        documentDir: () => Promise<string>;
        downloadDir: () => Promise<string>;
        pictureDir: () => Promise<string>;
        videoDir: () => Promise<string>;
        audioDir: () => Promise<string>;
        publicDir: () => Promise<string>;
        templateDir: () => Promise<string>;
        appConfigDir: () => Promise<string>;
        appDataDir: () => Promise<string>;
        appLocalDataDir: () => Promise<string>;
        appCacheDir: () => Promise<string>;
        appLogDir: () => Promise<string>;
        resourceDir: () => Promise<string>;
        executableDir: () => Promise<string>;
        cacheDir: () => Promise<string>;
        localDataDir: () => Promise<string>;
        dataDir: () => Promise<string>;
        configDir: () => Promise<string>;
        runtimeDir: () => Promise<string>;
        tempDir: () => Promise<string>;
        fontDir: () => Promise<string>;
      };
    };
  }
}

export {};

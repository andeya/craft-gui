/**
 * Debug utilities for development
 */

const isDevelopment = import.meta.env.DEV;

export interface DebugOptions {
  component?: string;
  level?: "log" | "warn" | "error" | "info";
  enabled?: boolean;
}

export class DebugLogger {
  private component: string;
  private enabled: boolean;

  constructor(component: string, options: DebugOptions = {}) {
    this.component = component;
    this.enabled = options.enabled ?? isDevelopment;
  }

  log(message: string, data?: any): void {
    if (!this.enabled) return;
    console.log(`[${this.component}] ${message}`, data || "");
  }

  warn(message: string, data?: any): void {
    if (!this.enabled) return;
    console.warn(`[${this.component}] ${message}`, data || "");
  }

  error(message: string, error?: any): void {
    if (!this.enabled) return;
    console.error(`[${this.component}] ${message}`, error || "");
  }

  info(message: string, data?: any): void {
    if (!this.enabled) return;
    console.info(`[${this.component}] ${message}`, data || "");
  }

  // Method to temporarily enable/disable logging
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Debug whitelist - components that should show debug logs
const DEBUG_WHITELIST = new Set([
  "SchemaDataForm",
  "SchemaApiForm",
  "SchemaField",
  // Add more components here as needed
]);

// Global debug configuration
export const debugConfig = {
  enabled: isDevelopment,
};

// Factory function to create debug loggers
export function createDebugLogger(component: string): DebugLogger {
  return new DebugLogger(component, {
    enabled: debugConfig.enabled && DEBUG_WHITELIST.has(component),
  });
}

// Global debug control
export function enableAllDebug(): void {
  debugConfig.enabled = true;
}

export function disableAllDebug(): void {
  debugConfig.enabled = false;
}

// Initialize debug in development mode
if (isDevelopment) {
  console.log("[Debug] Debug utilities initialized in development mode");
  enableAllDebug();
}

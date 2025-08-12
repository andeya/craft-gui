// Application configuration utilities
import packageJson from "../../package.json";

/**
 * Get application name from package.json
 */
export function getAppName(): string {
  return packageJson.name || "CraftGUI";
}

/**
 * Get application version from package.json
 */
export function getAppVersion(): string {
  return packageJson.version || "0.0.0";
}

/**
 * Get application description from package.json
 */
export function getAppDescription(): string {
  return packageJson.description || "";
}

/**
 * Get all application metadata from package.json
 */
export function getAppMetadata() {
  return {
    name: getAppName(),
    version: getAppVersion(),
    description: getAppDescription(),
  };
}

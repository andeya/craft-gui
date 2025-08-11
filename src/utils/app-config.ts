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

/**
 * Set page title dynamically
 */
export function setPageTitle(title?: string): void {
  const appName = getAppName();
  const fullTitle = title ? `${title} - ${appName}` : appName;
  document.title = fullTitle;
}

/**
 * Get formatted page title
 */
export function getPageTitle(title?: string): string {
  const appName = getAppName();
  return title ? `${title} - ${appName}` : appName;
}

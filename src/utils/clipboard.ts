/**
 * Cross-platform clipboard utility
 * Compatible with Tauri v2 webview, browsers, and various platforms
 */

// Platform detection
const isTauri = typeof window !== "undefined" && "__TAURI__" in window;
const isWebView = isTauri;
const isMobile =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);

/**
 * Copy text to clipboard with platform-specific fallbacks
 * @param text - Text to copy to clipboard
 * @returns Promise<boolean> - Success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Method 1: Modern Clipboard API (supported in most modern browsers and Tauri webview)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Method 2: Tauri-specific clipboard API (if available)
    if (isTauri) {
      try {
        // Note: Tauri v2 doesn't have a built-in clipboard plugin by default
        // We'll use the webview's clipboard API which should work
        await navigator.clipboard.writeText(text);
        return true;
      } catch (tauriError) {
        console.warn(
          "Tauri clipboard failed, falling back to fallback method:",
          tauriError
        );
      }
    }

    // Method 3: Fallback for older browsers and edge cases
    return await fallbackCopyToClipboard(text);
  } catch (error) {
    console.error("Clipboard copy failed:", error);
    return false;
  }
}

/**
 * Read text from clipboard with platform-specific fallbacks
 * @returns Promise<string> - Clipboard text content
 */
export async function readFromClipboard(): Promise<string> {
  try {
    // Method 1: Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }

    // Method 2: Tauri-specific clipboard API
    if (isTauri) {
      try {
        return await navigator.clipboard.readText();
      } catch (tauriError) {
        console.warn("Tauri clipboard read failed:", tauriError);
        throw new Error("Clipboard read not supported in this environment");
      }
    }

    throw new Error("Clipboard read not supported in this browser");
  } catch (error) {
    console.error("Clipboard read failed:", error);
    throw error;
  }
}

/**
 * Fallback clipboard copy method using document.execCommand
 * @param text - Text to copy
 * @returns Promise<boolean> - Success status
 */
async function fallbackCopyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Make it invisible
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      textArea.style.opacity = "0";
      textArea.style.pointerEvents = "none";
      textArea.style.zIndex = "-1";

      document.body.appendChild(textArea);

      // Select and copy
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");

      // Clean up
      document.body.removeChild(textArea);

      resolve(successful);
    } catch (error) {
      console.error("Fallback clipboard copy failed:", error);
      resolve(false);
    }
  });
}

/**
 * Check if clipboard API is supported
 * @returns boolean - Whether clipboard operations are supported
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}

/**
 * Check if clipboard read is supported
 * @returns boolean - Whether clipboard read is supported
 */
export function isClipboardReadSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.readText);
}

/**
 * Platform information for debugging
 */
export const clipboardPlatformInfo = {
  isTauri,
  isWebView,
  isMobile,
  isIOS,
  isAndroid,
  userAgent: navigator.userAgent,
  clipboardSupported: isClipboardSupported(),
  clipboardReadSupported: isClipboardReadSupported(),
};

/**
 * Enhanced copy function with notification support
 * @param text - Text to copy
 * @param options - Copy options
 * @returns Promise<boolean> - Success status
 */
export async function copyWithNotification(
  text: string,
  options: {
    successMessage?: string;
    errorMessage?: string;
    showNotification?: boolean;
    notify?: (type: string, message: string) => void;
  } = {}
): Promise<boolean> {
  const {
    successMessage = "Copied to clipboard",
    errorMessage = "Failed to copy to clipboard",
    showNotification = true,
    notify,
  } = options;

  const success = await copyToClipboard(text);

  if (showNotification && notify) {
    if (success) {
      notify("positive", successMessage);
    } else {
      notify("negative", errorMessage);
    }
  }

  return success;
}

/**
 * Copy multiple items to clipboard (if supported)
 * @param items - Array of clipboard items
 * @returns Promise<boolean> - Success status
 */
export async function copyMultipleToClipboard(
  items: Array<{ type: string; data: string }>
): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      const clipboardItems = items.map(
        (item) =>
          new ClipboardItem({
            [item.type]: new Blob([item.data], { type: item.type }),
          })
      );
      await navigator.clipboard.write(clipboardItems);
      return true;
    }

    // Fallback: copy the first text item
    const textItem = items.find((item) => item.type === "text/plain");
    if (textItem) {
      return await copyToClipboard(textItem.data);
    }

    return false;
  } catch (error) {
    console.error("Multiple clipboard copy failed:", error);
    return false;
  }
}

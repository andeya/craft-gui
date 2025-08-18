/**
 * Clipboard utility test functions
 * For debugging and testing clipboard functionality across platforms
 */

import {
  copyToClipboard,
  readFromClipboard,
  isClipboardSupported,
  isClipboardReadSupported,
  clipboardPlatformInfo,
  copyWithNotification,
  copyMultipleToClipboard,
  tauriCopyToClipboard,
  tauriReadFromClipboard,
} from "./clipboard";

/**
 * Test clipboard functionality and log results
 */
export async function testClipboardFunctionality() {
  console.log("=== Clipboard Platform Info ===");
  console.log(clipboardPlatformInfo);

  console.log("\n=== Testing Clipboard Support ===");
  console.log("Clipboard write supported:", isClipboardSupported());
  console.log("Clipboard read supported:", isClipboardReadSupported());

  console.log("\n=== Testing Clipboard Copy ===");
  const testText = "Hello from clipboard test! " + new Date().toISOString();
  const copyResult = await copyToClipboard(testText);
  console.log("Copy result:", copyResult);

  if (isClipboardReadSupported()) {
    console.log("\n=== Testing Clipboard Read ===");
    try {
      const readText = await readFromClipboard();
      console.log("Read text:", readText);
      console.log("Read matches copy:", readText === testText);
    } catch (error) {
      console.error("Read failed:", error);
    }
  }

  console.log("\n=== Testing Multiple Clipboard Copy ===");
  const multipleItems = [
    { type: "text/plain", data: "Plain text content" },
    { type: "text/html", data: "<p>HTML content</p>" },
  ];
  const multipleResult = await copyMultipleToClipboard(multipleItems);
  console.log("Multiple copy result:", multipleResult);

  console.log("\n=== Testing Tauri v2 Specific Functions ===");
  const tauriCopyResult = await tauriCopyToClipboard("Tauri v2 test text");
  console.log("Tauri copy result:", tauriCopyResult);

  if (isClipboardReadSupported()) {
    try {
      const tauriReadText = await tauriReadFromClipboard();
      console.log("Tauri read text:", tauriReadText);
    } catch (error) {
      console.error("Tauri read failed:", error);
    }
  }
}

/**
 * Test clipboard with notification
 */
export async function testClipboardWithNotification(
  notify: (type: string, message: string) => void
) {
  const testText = "Test notification clipboard! " + new Date().toISOString();

  await copyWithNotification(testText, {
    successMessage: "Test copy successful!",
    errorMessage: "Test copy failed!",
    notify,
  });
}

/**
 * Get clipboard diagnostic information
 */
export function getClipboardDiagnostics() {
  return {
    platform: clipboardPlatformInfo,
    support: {
      write: isClipboardSupported(),
      read: isClipboardReadSupported(),
    },
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
}

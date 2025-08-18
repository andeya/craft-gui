/**
 * Clipboard usage examples
 * Demonstrates how to use the Tauri v2 clipboard-manager plugin with permissions
 */

import {
  copyToClipboard,
  readFromClipboard,
  copyWithNotification,
  setClipboardPermissions,
  getClipboardPermissions,
  canWriteText,
  canReadText,
  canClearClipboard,
} from "./clipboard";

import {
  clipboardPermissionValidator,
  DEFAULT_CLIPBOARD_PERMISSIONS,
  PERMISSIVE_CLIPBOARD_PERMISSIONS,
  WRITE_ONLY_CLIPBOARD_PERMISSIONS,
  READ_ONLY_CLIPBOARD_PERMISSIONS,
  type ClipboardPermissions,
} from "./clipboard-permissions";

/**
 * Example 1: Basic clipboard operations
 */
export async function basicClipboardExample() {
  console.log("=== Basic Clipboard Operations ===");

  // Copy text to clipboard
  const copyResult = await copyToClipboard("Hello from Tauri v2!");
  console.log("Copy result:", copyResult);

  // Read text from clipboard
  try {
    const text = await readFromClipboard();
    console.log("Read text:", text);
  } catch (error) {
    console.error("Read failed:", error);
  }
}

/**
 * Example 2: Clipboard with notifications
 */
export async function clipboardWithNotificationsExample(
  notify: (type: string, message: string) => void
) {
  console.log("=== Clipboard with Notifications ===");

  await copyWithNotification("Copied with notification!", {
    successMessage: "Text copied successfully!",
    errorMessage: "Failed to copy text",
    notify,
  });
}

/**
 * Example 3: Permission management
 */
export function permissionManagementExample() {
  console.log("=== Permission Management ===");

  // Get current permissions
  const currentPermissions = getClipboardPermissions();
  console.log("Current permissions:", currentPermissions);

  // Check specific permissions
  console.log("Can write text:", canWriteText());
  console.log("Can read text:", canReadText());
  console.log("Can clear clipboard:", canClearClipboard());

  // Set restrictive permissions (write-only)
  setClipboardPermissions(WRITE_ONLY_CLIPBOARD_PERMISSIONS);
  console.log("After setting write-only permissions:");
  console.log("Can write text:", canWriteText());
  console.log("Can read text:", canReadText());

  // Restore default permissions
  setClipboardPermissions(DEFAULT_CLIPBOARD_PERMISSIONS);
}

/**
 * Example 4: Different permission configurations
 */
export function permissionConfigurationsExample() {
  console.log("=== Permission Configurations ===");

  // Default permissions (text read/write only)
  console.log("Default permissions:", DEFAULT_CLIPBOARD_PERMISSIONS);

  // Permissive permissions (all operations allowed)
  console.log("Permissive permissions:", PERMISSIVE_CLIPBOARD_PERMISSIONS);

  // Write-only permissions
  console.log("Write-only permissions:", WRITE_ONLY_CLIPBOARD_PERMISSIONS);

  // Read-only permissions
  console.log("Read-only permissions:", READ_ONLY_CLIPBOARD_PERMISSIONS);
}

/**
 * Example 5: Custom permission validator
 */
export function customPermissionValidatorExample() {
  console.log("=== Custom Permission Validator ===");

  // Create custom permissions
  const customPermissions: ClipboardPermissions = {
    allowWriteText: true,
    allowReadText: false,
    allowWriteHtml: true,
    allowWriteImage: false,
    allowReadImage: false,
    allowClear: true,
  };

  // Create custom validator
  const customValidator = new (clipboardPermissionValidator.constructor as any)(
    customPermissions
  );

  console.log(
    "Custom validator permissions:",
    customValidator.getPermissions()
  );
  console.log("Can write text:", customValidator.canWriteText());
  console.log("Can read text:", customValidator.canReadText());
  console.log("Can write HTML:", customValidator.canWriteHtml());
  console.log("Can clear:", customValidator.canClear());
}

/**
 * Example 6: Error handling with permissions
 */
export async function errorHandlingExample() {
  console.log("=== Error Handling with Permissions ===");

  // Set read-only permissions
  setClipboardPermissions(READ_ONLY_CLIPBOARD_PERMISSIONS);

  // Try to write (should fail)
  const writeResult = await copyToClipboard("This should fail");
  console.log("Write result:", writeResult); // Should be false

  // Try to read (should succeed)
  try {
    const text = await readFromClipboard();
    console.log("Read result:", text);
  } catch (error) {
    console.error("Read error:", error);
  }

  // Restore default permissions
  setClipboardPermissions(DEFAULT_CLIPBOARD_PERMISSIONS);
}

/**
 * Example 7: Permission-aware clipboard operations
 */
export async function permissionAwareOperationsExample() {
  console.log("=== Permission-Aware Operations ===");

  // Check permissions before operations
  if (canWriteText()) {
    console.log("Writing to clipboard...");
    await copyToClipboard("Permission-aware copy");
  } else {
    console.log("Write permission denied");
  }

  if (canReadText()) {
    console.log("Reading from clipboard...");
    try {
      const text = await readFromClipboard();
      console.log("Read:", text);
    } catch (error) {
      console.error("Read failed:", error);
    }
  } else {
    console.log("Read permission denied");
  }
}

/**
 * Example 8: Dynamic permission updates
 */
export async function dynamicPermissionUpdatesExample() {
  console.log("=== Dynamic Permission Updates ===");

  // Start with default permissions
  setClipboardPermissions(DEFAULT_CLIPBOARD_PERMISSIONS);
  console.log("Initial permissions:", getClipboardPermissions());

  // Temporarily disable write
  setClipboardPermissions({
    ...DEFAULT_CLIPBOARD_PERMISSIONS,
    allowWriteText: false,
  });
  console.log("After disabling write:", getClipboardPermissions());

  // Try to write (should fail)
  const writeResult = await copyToClipboard("This should fail");
  console.log("Write result:", writeResult);

  // Re-enable write
  setClipboardPermissions({
    ...DEFAULT_CLIPBOARD_PERMISSIONS,
    allowWriteText: true,
  });
  console.log("After re-enabling write:", getClipboardPermissions());

  // Try to write again (should succeed)
  const writeResult2 = await copyToClipboard("This should succeed");
  console.log("Write result 2:", writeResult2);
}

/**
 * Run all examples
 */
export async function runAllExamples(
  notify?: (type: string, message: string) => void
) {
  console.log("Running all clipboard examples...\n");

  basicClipboardExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (notify) {
    clipboardWithNotificationsExample(notify);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  permissionManagementExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  permissionConfigurationsExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  customPermissionValidatorExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  errorHandlingExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  permissionAwareOperationsExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  dynamicPermissionUpdatesExample();

  console.log("\nAll examples completed!");
}

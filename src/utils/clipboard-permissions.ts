/**
 * Clipboard permissions configuration
 * Based on Tauri v2 clipboard-manager plugin permissions
 */

export interface ClipboardPermissions {
  // Text operations
  allowWriteText: boolean;
  allowReadText: boolean;

  // HTML operations
  allowWriteHtml: boolean;

  // Image operations
  allowWriteImage: boolean;
  allowReadImage: boolean;

  // Clear operation
  allowClear: boolean;
}

/**
 * Default clipboard permissions
 * These match the Tauri clipboard-manager plugin default permissions
 */
export const DEFAULT_CLIPBOARD_PERMISSIONS: ClipboardPermissions = {
  allowWriteText: true,
  allowReadText: true,
  allowWriteHtml: false,
  allowWriteImage: false,
  allowReadImage: false,
  allowClear: false,
};

/**
 * Permissive clipboard permissions (all operations allowed)
 * Use with caution - only for applications that need full clipboard access
 */
export const PERMISSIVE_CLIPBOARD_PERMISSIONS: ClipboardPermissions = {
  allowWriteText: true,
  allowReadText: true,
  allowWriteHtml: true,
  allowWriteImage: true,
  allowReadImage: true,
  allowClear: true,
};

/**
 * Restrictive clipboard permissions (write-only)
 * Only allows writing to clipboard, no reading
 */
export const WRITE_ONLY_CLIPBOARD_PERMISSIONS: ClipboardPermissions = {
  allowWriteText: true,
  allowReadText: false,
  allowWriteHtml: false,
  allowWriteImage: false,
  allowReadImage: false,
  allowClear: false,
};

/**
 * Read-only clipboard permissions
 * Only allows reading from clipboard, no writing
 */
export const READ_ONLY_CLIPBOARD_PERMISSIONS: ClipboardPermissions = {
  allowWriteText: false,
  allowReadText: true,
  allowWriteHtml: false,
  allowWriteImage: false,
  allowReadImage: false,
  allowClear: false,
};

/**
 * Permission validation functions
 */
export class ClipboardPermissionValidator {
  private permissions: ClipboardPermissions;

  constructor(
    permissions: ClipboardPermissions = DEFAULT_CLIPBOARD_PERMISSIONS
  ) {
    this.permissions = permissions;
  }

  /**
   * Check if text writing is allowed
   */
  canWriteText(): boolean {
    return this.permissions.allowWriteText;
  }

  /**
   * Check if text reading is allowed
   */
  canReadText(): boolean {
    return this.permissions.allowReadText;
  }

  /**
   * Check if HTML writing is allowed
   */
  canWriteHtml(): boolean {
    return this.permissions.allowWriteHtml;
  }

  /**
   * Check if image writing is allowed
   */
  canWriteImage(): boolean {
    return this.permissions.allowWriteImage;
  }

  /**
   * Check if image reading is allowed
   */
  canReadImage(): boolean {
    return this.permissions.allowReadImage;
  }

  /**
   * Check if clear operation is allowed
   */
  canClear(): boolean {
    return this.permissions.allowClear;
  }

  /**
   * Validate operation with error throwing
   */
  validateWriteText(): void {
    if (!this.canWriteText()) {
      throw new Error("Clipboard write text permission denied");
    }
  }

  validateReadText(): void {
    if (!this.canReadText()) {
      throw new Error("Clipboard read text permission denied");
    }
  }

  validateWriteHtml(): void {
    if (!this.canWriteHtml()) {
      throw new Error("Clipboard write HTML permission denied");
    }
  }

  validateWriteImage(): void {
    if (!this.canWriteImage()) {
      throw new Error("Clipboard write image permission denied");
    }
  }

  validateReadImage(): void {
    if (!this.canReadImage()) {
      throw new Error("Clipboard read image permission denied");
    }
  }

  validateClear(): void {
    if (!this.canClear()) {
      throw new Error("Clipboard clear permission denied");
    }
  }

  /**
   * Get current permissions
   */
  getPermissions(): ClipboardPermissions {
    return { ...this.permissions };
  }

  /**
   * Update permissions
   */
  updatePermissions(newPermissions: Partial<ClipboardPermissions>): void {
    this.permissions = { ...this.permissions, ...newPermissions };
  }
}

/**
 * Global permission validator instance
 */
export const clipboardPermissionValidator = new ClipboardPermissionValidator();

/**
 * Permission-aware clipboard functions
 */
export class PermissionAwareClipboard {
  private validator: ClipboardPermissionValidator;

  constructor(
    validator: ClipboardPermissionValidator = clipboardPermissionValidator
  ) {
    this.validator = validator;
  }

  /**
   * Copy text with permission check
   */
  async copyText(_text: string): Promise<boolean> {
    this.validator.validateWriteText();
    // This will be implemented in the main clipboard file
    return true;
  }

  /**
   * Read text with permission check
   */
  async readText(): Promise<string> {
    this.validator.validateReadText();
    // This will be implemented in the main clipboard file
    return "";
  }

  /**
   * Clear clipboard with permission check
   */
  async clear(): Promise<boolean> {
    this.validator.validateClear();
    // This will be implemented in the main clipboard file
    return true;
  }
}

/**
 * Utility functions for permission management
 */

/**
 * Set clipboard permissions
 */
export function setClipboardPermissions(
  permissions: ClipboardPermissions
): void {
  clipboardPermissionValidator.updatePermissions(permissions);
}

/**
 * Get current clipboard permissions
 */
export function getClipboardPermissions(): ClipboardPermissions {
  return clipboardPermissionValidator.getPermissions();
}

/**
 * Check if a specific operation is allowed
 */
export function canWriteText(): boolean {
  return clipboardPermissionValidator.canWriteText();
}

export function canReadText(): boolean {
  return clipboardPermissionValidator.canReadText();
}

export function canWriteHtml(): boolean {
  return clipboardPermissionValidator.canWriteHtml();
}

export function canWriteImage(): boolean {
  return clipboardPermissionValidator.canWriteImage();
}

export function canReadImage(): boolean {
  return clipboardPermissionValidator.canReadImage();
}

export function canClear(): boolean {
  return clipboardPermissionValidator.canClear();
}

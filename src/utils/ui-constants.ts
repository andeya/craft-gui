/**
 * UI constants
 * Centralized management of UI text and messages
 */

export const UI_MESSAGES = {
  // Dialog titles
  DIALOG: {
    ERROR: "Error",
    SUCCESS: "Success",
    WARNING: "Warning",
    CONFIRM: "Confirm",
    SAVE_DATA: "Save Data",
    DELETE_DATA: "Delete Data",
    RELOAD_DATA: "Reload Data",
    RESET_FORM: "Reset Form",
  },

  // Common messages
  COMMON: {
    SCHEMA_ID_REQUIRED: "Schema id is required",
    CANNOT_LOAD_DATA: "Cannot load data: missing schema or key",
    SAVE_CONFIRMATION: "Are you sure you want to save the current data?",
    DELETE_CONFIRMATION:
      "Are you sure you want to delete this data? This action cannot be undone.",
    RELOAD_CONFIRMATION:
      "Are you sure you want to reload data from the server? This will discard any unsaved changes.",
    RESET_CONFIRMATION:
      "Are you sure you want to reset all fields to their original values?",
  },

  // Success messages
  SUCCESS: {
    DATA_SAVED: "Data saved successfully",
    DATA_UPDATED: "Data updated successfully",
    NEW_DATA_CREATED: "New data created successfully",
    DATA_DELETED: "Data deleted successfully",
    DATA_RELOADED: "Data reloaded successfully",
  },

  // Error messages
  ERROR: {
    FAILED_TO_LOAD_SCHEMA: "Failed to load schema",
    FAILED_TO_LOAD_DATA: "Failed to load data",
    FAILED_TO_SAVE_DATA: "Failed to save data",
    FAILED_TO_DELETE_DATA: "Failed to delete data",
    FAILED_TO_PREPARE_NEW_DATA: "Failed to prepare new data form",
  },

  // Form labels
  FORM: {
    SCHEMA: "Schema",
    KEY: "Key",
    NEW: "New",
    RELOAD: "Reload",
    SAVE: "Save",
    DELETE: "Delete",
    CREATE_NEW: "Create New",
    CREATE_NEW_DATA: "Create New Data",
    EDIT_DATA: "Edit Data",
    FILL_FIELDS_TO_CREATE: "Fill in the fields below to create new data",
    MODIFY_FIELDS_TO_UPDATE: "Modify the fields below to update the data",
  },

  // Tooltips
  TOOLTIPS: {
    COMPACT_MODE: "Compact Mode",
    NEW: "New",
    RELOAD: "Reload",
    SAVE: "Save",
    DELETE: "Delete",
  },

  // Empty state messages
  EMPTY_STATE: {
    NO_SCHEMAS_AVAILABLE: "No Schemas Available",
    READY_TO_CREATE: "Ready to Create",
    NO_FORM_FIELDS: "No Form Fields",
    NO_DATA_FOUND: "No Data Found",
    CONFIGURE_SCHEMAS: "Please configure available schemas to use this form.",
    FORM_READY_FOR_NEW_DATA:
      "Form is ready for new data with key {key}. Fill in the fields below and click Save to create.",
    NO_FORM_FIELDS_AVAILABLE: "No form fields available for this schema.",
    NO_DATA_FOUND_FOR_KEY:
      'No data found for key {key}. Click "Create New" to start with a new record.',
  },
} as const;

/**
 * Get dialog title by type
 */
export function getDialogTitle(type: keyof typeof UI_MESSAGES.DIALOG): string {
  return UI_MESSAGES.DIALOG[type];
}

/**
 * Get common message by key
 */
export function getCommonMessage(key: keyof typeof UI_MESSAGES.COMMON): string {
  return UI_MESSAGES.COMMON[key];
}

/**
 * Get success message by key
 */
export function getSuccessMessage(
  key: keyof typeof UI_MESSAGES.SUCCESS
): string {
  return UI_MESSAGES.SUCCESS[key];
}

/**
 * Get error message by key
 */
export function getErrorMessage(key: keyof typeof UI_MESSAGES.ERROR): string {
  return UI_MESSAGES.ERROR[key];
}

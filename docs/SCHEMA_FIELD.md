# SchemaField Component Usage Guide

## Overview

`SchemaField` is a universal form field rendering component that automatically renders appropriate form controls based on JSON Schema definitions. It supports multiple data types and validation rules. This component is the core field renderer for SchemaDataForm and SchemaApiForm.

## Key Features

- 🔄 **Dynamic Field Rendering**: Automatically renders appropriate form controls based on JSON Schema
- 📝 **Multi-Type Support**: Supports string, number, boolean, object, array, and other types
- ✅ **Automatic Validation**: Real-time validation based on schema rules
- 🎨 **Customizable Styles**: Supports compact mode and custom styles
- 🔍 **Change Tracking**: Visual indicators for field modification status
- 📱 **Responsive Design**: Supports different layout modes
- 🎯 **Smart Layout**: Single fields are automatically centered

## Supported Data Types

### 1. String Type (string)

- **Plain Text Input**: Single-line text input box
- **Select Dropdown**: When schema defines `enum`
- **Validation Rules**: `minLength`, `maxLength`, `pattern`, etc.

### 2. Number Type (integer/number)

- **Number Input**: Supports integers and decimals
- **Range Validation**: `minimum`, `maximum`, etc.
- **Step Control**: `multipleOf`, etc.

### 3. Boolean Type (boolean)

- **Toggle Control**: Uses QToggle component
- **Checkbox**: Used in compact mode

### 4. Object Type (object)

- **Nested Form**: Recursively renders child fields
- **Object Validation**: Supports `required` field validation

### 5. Array Type (array)

- **JSON Editing**: Uses text area to edit JSON arrays
- **Array Validation**: Supports `minItems`, `maxItems`, etc.

## Basic Usage

```vue
<template>
  <SchemaField
    :schema="fieldSchema"
    :model-value="fieldValue"
    :root-schema="rootSchema"
    :is-modified="isFieldModified"
    :parent-key="fieldName"
    :check-nested-modification="checkNestedModification"
    :compact="false"
    @update:model-value="handleValueChange"
    @validation-error="handleValidationError"
    @validation-success="handleValidationSuccess"
  />
</template>

<script setup lang="ts">
import type { AppSchema } from "@/types/schema";

const fieldSchema: AppSchema = {
  type: "string",
  title: "Full Name",
  description: "Enter your full name",
  minLength: 1,
  maxLength: 100,
};

const fieldValue = ref("John Doe");
const isFieldModified = ref(false);

const handleValueChange = (value: any) => {
  fieldValue.value = value;
};

const handleValidationError = (error: string) => {
  console.error("Validation error:", error);
};

const handleValidationSuccess = () => {
  console.log("Validation passed");
};
</script>
```

## Props Properties

| Property Name             | Type                                               | Default       | Description                                        |
| ------------------------- | -------------------------------------------------- | ------------- | -------------------------------------------------- |
| `schema`                  | `AppSchema`                                        | -             | **Required** - Field's JSON Schema definition      |
| `modelValue`              | `FieldValue`                                       | -             | **Required** - Field's current value               |
| `rootSchema`              | `AppSchema \| null`                                | `null`        | Root schema (for resolving $ref)                   |
| `isModified`              | `boolean`                                          | `false`       | Whether the field has been modified                |
| `parentKey`               | `string`                                           | `""`          | Parent field's key name                            |
| `checkNestedModification` | `(parentKey: string, childKey: string) => boolean` | `() => false` | Function to check nested field modification status |
| `compact`                 | `boolean`                                          | `false`       | Whether to use compact mode                        |

## Events

| Event Name           | Parameters          | Description                        |
| -------------------- | ------------------- | ---------------------------------- |
| `update:model-value` | `value: FieldValue` | Triggered when field value updates |
| `validation-error`   | `error: string`     | Triggered when validation fails    |
| `validation-success` | -                   | Triggered when validation passes   |

## Field Type Examples

### String Field

```typescript
const stringSchema: AppSchema = {
  type: "string",
  title: "Email Address",
  description: "Enter your email address",
  format: "email",
  minLength: 5,
  maxLength: 100,
};
```

### Number Field

```typescript
const numberSchema: AppSchema = {
  type: "integer",
  title: "Age",
  description: "Enter your age",
  minimum: 0,
  maximum: 150,
};
```

### Boolean Field

```typescript
const booleanSchema: AppSchema = {
  type: "boolean",
  title: "Is Active",
  description: "Whether the user is active",
};
```

### Select Field

```typescript
const selectSchema: AppSchema = {
  type: "string",
  title: "Country",
  description: "Select your country",
  enum: ["USA", "Canada", "UK", "Germany", "France"],
};
```

### Object Field

```typescript
const objectSchema: AppSchema = {
  type: "object",
  title: "Address",
  description: "Enter your address",
  properties: {
    street: {
      type: "string",
      title: "Street Address",
    },
    city: {
      type: "string",
      title: "City",
    },
    zipCode: {
      type: "string",
      title: "ZIP Code",
    },
  },
  required: ["street", "city"],
};
```

### Array Field

```typescript
const arraySchema: AppSchema = {
  type: "array",
  title: "Tags",
  description: "Enter tags as JSON array",
  items: {
    type: "string",
  },
  minItems: 1,
  maxItems: 10,
};
```

## Advanced Usage

### Nested Object Rendering

```vue
<template>
  <SchemaField
    :schema="addressSchema"
    :model-value="addressValue"
    :root-schema="rootSchema"
    :is-modified="isAddressModified"
    :parent-key="'address'"
    :check-nested-modification="checkNestedModification"
    @update:model-value="handleAddressChange"
  />
</template>

<script setup lang="ts">
const addressSchema: AppSchema = {
  type: "object",
  title: "Address",
  properties: {
    street: {
      type: "string",
      title: "Street",
      required: true,
    },
    city: {
      type: "string",
      title: "City",
      required: true,
    },
    country: {
      type: "string",
      title: "Country",
      enum: ["USA", "Canada", "UK"],
    },
  },
};

const addressValue = ref({
  street: "123 Main St",
  city: "New York",
  country: "USA",
});

const checkNestedModification = (parentKey: string, childKey: string) => {
  // Check if nested field has been modified
  return false;
};
</script>
```

### Custom Validation Rules

```typescript
// Validation rules defined in schema are automatically applied
const customValidationSchema: AppSchema = {
  type: "string",
  title: "Phone Number",
  description: "Enter phone number",
  pattern: "^\\+?[1-9]\\d{1,14}$", // International phone number format
  minLength: 10,
  maxLength: 15,
};
```

### Compact Mode

```vue
<template>
  <SchemaField
    :schema="fieldSchema"
    :model-value="fieldValue"
    :compact="true"
    @update:model-value="handleValueChange"
  />
</template>
```

## Style Customization

### Compact Mode Styles

```css
.schema-field.compact-mode {
  margin-bottom: 0.125rem;
  padding-bottom: 0.125rem;
}

.schema-field.compact-mode .field-header {
  margin-bottom: 0.125rem;
}

.schema-field.compact-mode .field-header label {
  margin-bottom: 0.125rem;
  font-size: 0.875rem;
}
```

### Modification Status Indicator

```css
.field-input-wrapper.field-modified {
  border-left: 3px solid #ffc107;
  padding-left: 8px;
  border-radius: 3px;
}
```

### Validation Error Styles

```css
.validation-error {
  display: flex;
  align-items: center;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  padding: 4px 6px;
  margin-top: 0.125rem;
  font-size: 0.875rem;
}
```

## Best Practices

### 1. Schema Design

```typescript
// Good schema design
const goodSchema: AppSchema = {
  type: "string",
  title: "User Name", // Provide clear title
  description: "Enter your full name", // Provide description
  minLength: 1, // Set minimum length
  maxLength: 50, // Set maximum length
  pattern: "^[a-zA-Z\\s]+$", // Set format validation
};

// Avoid this design
const badSchema: AppSchema = {
  type: "string", // Missing title and description
  // No validation rules
};
```

### 2. Error Handling

```vue
<script setup lang="ts">
const handleValidationError = (error: string) => {
  // Log error
  console.error("Field validation error:", error);

  // Show user-friendly error message
  showNotification({
    type: "negative",
    message: error,
  });
};

const handleValidationSuccess = () => {
  // Clear error status
  clearFieldError();
};
</script>
```

### 3. Performance Optimization

```vue
<script setup lang="ts">
// Use computed for performance optimization
const fieldDisplayName = computed(() => {
  return props.schema.title || "Field";
});

// Use watch to handle value changes
watch(
  () => props.modelValue,
  (newValue) => {
    // Handle value change logic
  },
  { immediate: true }
);
</script>
```

## Common Questions

### Q: How to handle complex nested objects?

A: SchemaField automatically recursively renders nested objects. Ensure `properties` and `required` fields are correctly defined in the schema.

### Q: How to customize field rendering logic?

A: You can extend the SchemaField component or create custom field components. SchemaField supports different rendering logic through the `type` field.

### Q: How to handle array type fields?

A: The current version uses JSON text area to edit arrays. Future versions may provide more user-friendly array editing interfaces.

### Q: How to add custom validation rules?

A: Use `pattern`, `format`, and other fields in JSON Schema to define validation rules. SchemaField automatically applies these rules.

## Extension Development

### Adding New Field Types

```typescript
// Add new type support in SchemaField component
const isCustomType = computed((): boolean => {
  return resolvedSchema.value.type === "custom";
});

// Add rendering logic in template
<div v-if="isCustomType" class="custom-field">
  <!-- Custom field rendering logic -->
</div>
```

### Custom Validation Logic

```typescript
// Add custom validation in validationRules computed
const validationRules = computed((): ValidationRule[] => {
  const rules: ValidationRule[] = [];

  // Add custom validation rules
  if (resolvedSchema.value.customValidation) {
    rules.push((val: any) => {
      // Custom validation logic
      return customValidationFunction(val) || "Custom validation failed";
    });
  }

  return rules;
});
```

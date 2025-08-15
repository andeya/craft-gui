# SchemaDataForm Component Usage Guide

## Overview

`SchemaDataForm` is a form component specifically designed for data management (CRUD operations). It loads schema definitions by specified schema name, supports create, read, update, and delete operations, and provides data persistence functionality.

## Key Features

- 🔄 **Dynamic Schema Loading**: Automatically loads schema definitions by schema name
- 💾 **Data Persistence**: Supports data save, load, and delete operations
- 📝 **CRUD Operations**: Complete create, read, update, delete functionality
- ✅ **Form Validation**: Real-time validation based on schema rules
- 🎨 **Customizable UI**: Supports custom buttons, titles, and descriptions
- 📱 **Responsive Design**: Supports compact mode and intelligent grid layout
- 🔍 **Change Tracking**: Visual indicators for modified fields
- 📊 **Diff Comparison**: Shows data changes before saving
- 🎯 **Smart Layout**: Field components implement layout logic internally, single fields are automatically centered

## Basic Usage

```vue
<template>
  <SchemaDataForm
    schema-name="UserProfile"
    :data-key="1"
    title="User Profile Management"
    description="Manage user profile data"
    @save="handleSave"
    @load="handleLoad"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
const handleSave = (data: Record<string, any>) => {
  console.log("Data saved:", data);
};

const handleLoad = (data: Record<string, any>) => {
  console.log("Data loaded:", data);
};

const handleDelete = () => {
  console.log("Data deleted");
};
</script>
```

## Props Properties

| Property Name        | Type                            | Default     | Description                                                |
| -------------------- | ------------------------------- | ----------- | ---------------------------------------------------------- |
| `schemaName`         | `string`                        | -           | Schema name                                                |
| `dataKey`            | `number`                        | `1`         | Data key (for identifying data records)                    |
| `title`              | `string`                        | -           | Form title                                                 |
| `description`        | `string`                        | -           | Form description                                           |
| `showHeader`         | `boolean`                       | `true`      | Whether to show form header                                |
| `compact`            | `boolean`                       | `true`      | Whether to use compact mode                                |
| `columns`            | `number`                        | `0`         | Field column layout (0=auto, 1=single, 2=double, 3=triple) |
| `showSaveButton`     | `boolean`                       | `true`      | Whether to show save button                                |
| `showDeleteButton`   | `boolean`                       | `true`      | Whether to show delete button                              |
| `showNewButton`      | `boolean`                       | `true`      | Whether to show new button                                 |
| `showReloadButton`   | `boolean`                       | `true`      | Whether to show reload button                              |
| `availableSchemas`   | `SchemaOption[]`                | `[]`        | Available schema options                                   |
| `mode`               | `'appdata' \| 'config'`         | `'appdata'` | Operation mode                                             |
| `showDiffBeforeSave` | `boolean \| string \| function` | -           | Whether to show diff before saving                         |

## Events

| Event Name           | Parameters                    | Description                        |
| -------------------- | ----------------------------- | ---------------------------------- |
| `save`               | `data: Record<string, any>`   | Triggered when data is saved       |
| `load`               | `data: Record<string, any>`   | Triggered when data is loaded      |
| `delete`             | -                             | Triggered when data is deleted     |
| `reload`             | -                             | Triggered when reloading           |
| `create`             | `data: Record<string, any>`   | Triggered when creating new data   |
| `prepare`            | `data: Record<string, any>`   | Triggered when preparing to create |
| `reset`              | `data: Record<string, any>`   | Triggered when form is reset       |
| `schema-change`      | `schemaName: string`          | Triggered when schema changes      |
| `key-change`         | `key: number`                 | Triggered when data key changes    |
| `validation-error`   | `errors: Map<string, string>` | Triggered when validation fails    |
| `validation-success` | -                             | Triggered when validation passes   |
| `notify`             | `notification: object`        | Notification event                 |

## Advanced Usage

### Configuration Mode

```vue
<template>
  <SchemaDataForm
    mode="config"
    schema-name="AppConfig"
    title="Application Settings"
    description="Configure application settings"
    :show-delete-button="false"
    :show-new-button="false"
    @save="handleConfigSave"
  />
</template>
```

### Dynamic Schema Selection

```vue
<template>
  <SchemaDataForm
    :available-schemas="availableSchemas"
    :data-key="currentKey"
    @schema-change="handleSchemaChange"
    @key-change="handleKeyChange"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";

const availableSchemas = [
  { name: "UserProfile", title: "User Profile" },
  { name: "ProductConfig", title: "Product Configuration" },
  { name: "SystemSettings", title: "System Settings" },
];

const currentKey = ref(1);

const handleSchemaChange = (schemaName: string) => {
  console.log("Schema changed to:", schemaName);
};

const handleKeyChange = (key: number) => {
  console.log("Key changed to:", key);
};
</script>
```

### Diff Comparison Feature

```vue
<template>
  <SchemaDataForm
    schema-name="UserProfile"
    :data-key="1"
    :show-diff-before-save="true"
    @save="handleSave"
  />
</template>
```

### Custom Layout

```vue
<template>
  <SchemaDataForm
    schema-name="ProductConfig"
    :data-key="1"
    :columns="2"
    :compact="false"
    title="Product Configuration"
    @save="handleSave"
  />
</template>
```

## Exposed Methods

The component exposes the following methods for parent components to call:

```vue
<template>
  <SchemaDataForm ref="dataFormRef" schema-name="test_schema" />
</template>

<script setup lang="ts">
import { ref } from "vue";

const dataFormRef = ref();

// Get current form data
const getData = () => {
  const data = dataFormRef.value.getFormData();
  console.log("Current form data:", data);
};

// Set form data
const setData = () => {
  dataFormRef.value.setFormData({
    field1: "value1",
    field2: "value2",
  });
};

// Manually validate form
const validate = () => {
  const isValid = dataFormRef.value.validate();
  console.log("Form is valid:", isValid);
};

// Manually save data
const save = () => {
  dataFormRef.value.save();
};

// Manually load data
const load = () => {
  dataFormRef.value.load();
};

// Manually delete data
const deleteData = () => {
  dataFormRef.value.delete();
};

// Reset form to initial state
const reset = () => {
  dataFormRef.value.reset();
};

// Create new data
const createNew = () => {
  dataFormRef.value.createNew();
};
</script>
```

## Comparison with SchemaApiForm

| Feature                  | SchemaDataForm            | SchemaApiForm           |
| ------------------------ | ------------------------- | ----------------------- |
| **Purpose**              | Data Management(CRUD)     | API Interface Calls     |
| **Data Persistence**     | ✅ Supported              | ❌ Not Supported        |
| **Schema Loading**       | ✅ Auto Loading           | ✅ Auto Loading         |
| **Default Values**       | ✅ Uses schema defaults   | ✅ Uses schema defaults |
| **Form Validation**      | ✅ Real-time validation   | ✅ Real-time validation |
| **Button Customization** | ⚠️ Partially customizable | ✅ Highly customizable  |
| **Grid Layout**          | ❌ Fixed layout           | ✅ Supports 1-4 columns |
| **Compact Mode**         | ✅ Supported              | ✅ Supported            |
| **Change Tracking**      | ✅ Supported              | ❌ Not Supported        |
| **Diff Comparison**      | ✅ Supported              | ❌ Not Supported        |

## Best Practices

1. **Data Key Management**: Use meaningful numeric keys to identify different data records
2. **Schema Design**: Ensure schemas define appropriate default values and validation rules
3. **Error Handling**: Always handle `validation-error` and `notify` events
4. **User Experience**: Use appropriate titles and descriptions to enhance user experience
5. **Performance Optimization**: Consider using `compact` mode for complex forms
6. **Data Backup**: Consider backup mechanisms before important data operations

## Example Scenarios

### User Profile Management

```vue
<SchemaDataForm
  schema-name="UserProfile"
  :data-key="1"
  title="User Profile Management"
  description="Manage user profile information"
  :columns="2"
  @save="handleUserSave"
  @load="handleUserLoad"
  @delete="handleUserDelete"
/>
```

### Product Configuration Management

```vue
<SchemaDataForm
  schema-name="ProductConfig"
  :data-key="currentProductId"
  title="Product Configuration"
  description="Configure product settings and parameters"
  :compact="true"
  @save="handleProductSave"
/>
```

### System Settings Management

```vue
<SchemaDataForm
  mode="config"
  schema-name="SystemSettings"
  title="System Settings"
  description="Configure system-wide settings"
  :show-delete-button="false"
  :show-new-button="false"
  @save="handleSystemSave"
/>
```

### Multi-Record Management

```vue
<template>
  <div>
    <div class="q-mb-md">
      <QBtn
        v-for="key in [1, 2, 3, 4, 5]"
        :key="key"
        :label="`Record ${key}`"
        :color="currentKey === key ? 'primary' : 'grey'"
        @click="currentKey = key"
        class="q-mr-sm"
      />
    </div>

    <SchemaDataForm
      schema-name="UserProfile"
      :data-key="currentKey"
      title="User Profile Management"
      @save="handleSave"
      @load="handleLoad"
    />
  </div>
</template>

<script setup lang="ts">
const currentKey = ref(1);
</script>
```

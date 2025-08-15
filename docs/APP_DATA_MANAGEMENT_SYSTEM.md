# Application Data Management System

## Overview

The Application Data Management System is a comprehensive solution for managing structured data within the CraftGUI application. It provides a unified interface for handling both application data (user data, product configurations, etc.) and application configuration (settings, preferences, etc.) through a schema-based approach.

## Architecture

### Core Components

The system consists of three main layers:

1. **Frontend Components** - Vue.js components for data management UI
2. **Backend Services** - Rust services for data persistence and validation
3. **Schema System** - JSON Schema 2020-12 based validation and form generation

### Data Flow

```
User Interface (SchemaDataForm)
    ↓
Tauri Commands (invoke)
    ↓
Rust Backend (appdata.rs)
    ↓
Storage Layer (sled/SQLite)
```

## Key Features

### 1. Schema-Based Form Generation

- **Dynamic Forms**: Forms are automatically generated from JSON Schema definitions
- **Type Safety**: Full TypeScript support with compile-time and runtime validation
- **Validation**: Built-in validation based on JSON Schema 2020-12 specification
- **UI Consistency**: Unified styling and behavior across all forms

### 2. Dual Mode Operation

The system supports two distinct modes:

#### AppData Mode

- **Purpose**: Managing user data, product configurations, and business data
- **Key Management**: Uses numeric keys (1, 2, 3, etc.) for data identification
- **CRUD Operations**: Full Create, Read, Update, Delete functionality
- **Multiple Records**: Supports multiple data records per schema

#### Config Mode

- **Purpose**: Managing application settings and configuration
- **Single Record**: Uses key 0 for single configuration record
- **Persistent Settings**: Application-wide settings storage
- **Auto-Load**: Automatically loads configuration on startup

### 3. Advanced Form Features

- **Change Tracking**: Visual indicators for modified fields
- **Diff View**: Before-save difference comparison
- **Validation Feedback**: Real-time validation with error messages
- **Empty States**: User-friendly empty state handling
- **Compact Mode**: Toggle between compact and full form layouts

## Component Architecture

### SchemaDataForm Component

The main form component that provides:

```typescript
interface SchemaDataFormProps {
  // Schema and data
  schemaName?: string;
  dataKey?: number;

  // UI configuration
  title?: string;
  description?: string;
  showHeader?: boolean;
  compact?: boolean;

  // Button control
  showSaveButton?: boolean;
  showDeleteButton?: boolean;
  showNewButton?: boolean;
  showReloadButton?: boolean;

  // Mode configuration
  mode?: "appdata" | "config";
  showDiffBeforeSave?: boolean;
}
```

### SchemaField Component

Individual field renderer supporting:

- **String Fields**: Text input, select dropdowns, pattern validation
- **Number Fields**: Numeric input with range validation
- **Boolean Fields**: Toggle switches and checkboxes
- **Object Fields**: Nested form structures
- **Array Fields**: JSON-based array editing

## Backend Integration

### Tauri Commands

The system uses centralized Tauri commands for backend communication:

```typescript
export const TAURI_COMMANDS = {
  APPDATA: {
    GET_SCHEMA: "appdata_cmd_get_schema",
    GET_DATA: "appdata_cmd_get_data",
    SAVE_DATA: "appdata_cmd_save_data",
    REMOVE_DATA: "appdata_cmd_remove_data",
    EXISTS_DATA: "appdata_cmd_exists_data",
    FIND_NEXT_AVAILABLE_KEY: "appdata_cmd_find_next_available_key",
  },
} as const;
```

### Rust Backend Services

The backend provides:

- **Schema Management**: Dynamic schema loading and validation
- **Data Persistence**: Sled database for high-performance storage
- **Key Management**: Automatic next available key detection
- **Error Handling**: Comprehensive error reporting and recovery

## Schema System

### Predefined Schemas

The system includes several predefined schemas:

1. **UserProfile**: User profile information
2. **ProductConfig**: Product configuration data
3. **SystemSettings**: System-wide settings
4. **AppConfig**: Application configuration

### Schema Definition Example

```typescript
const userProfileSchema = {
  type: "object",
  title: "User Profile",
  description: "User profile information",
  properties: {
    name: {
      type: "string",
      title: "Full Name",
      description: "Enter your full name",
      minLength: 1,
      maxLength: 100,
    },
    email: {
      type: "string",
      title: "Email Address",
      format: "email",
    },
    age: {
      type: "integer",
      title: "Age",
      minimum: 0,
      maximum: 150,
    },
    is_active: {
      type: "boolean",
      title: "Is Active",
      description: "Whether the user is active",
    },
  },
  required: ["name", "email"],
};
```

## Usage Examples

### Basic AppData Usage

```vue
<template>
  <SchemaDataForm
    mode="appdata"
    schema-name="UserProfile"
    :data-key="1"
    title="User Profile Management"
    description="Manage user profile data"
    @save="handleSave"
    @load="handleLoad"
  />
</template>
```

### Configuration Management

```vue
<template>
  <SchemaDataForm
    mode="config"
    schema-name="AppConfig"
    title="Application Settings"
    description="Configure application settings"
    @save="handleConfigSave"
  />
</template>
```

### Dynamic Schema Selection

```vue
<template>
  <SchemaDataForm
    mode="appdata"
    :available-schemas="availableSchemas"
    :data-key="currentKey"
    @schema-change="handleSchemaChange"
  />
</template>

<script setup>
const availableSchemas = [
  { name: "UserProfile", title: "User Profile" },
  { name: "ProductConfig", title: "Product Configuration" },
  { name: "SystemSettings", title: "System Settings" },
];
</script>
```

## Error Handling

### Frontend Error Handling

- **Validation Errors**: Real-time field validation with user feedback
- **Network Errors**: Graceful handling of Tauri command failures
- **Data Errors**: Clear error messages for data loading/saving issues

### Backend Error Handling

- **Schema Errors**: Invalid schema detection and reporting
- **Storage Errors**: Database operation error handling
- **Key Conflicts**: Automatic resolution of key conflicts

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Schemas are loaded only when needed
2. **Caching**: Schema and data caching for improved performance
3. **Debounced Validation**: Validation is debounced to reduce UI lag
4. **Incremental Updates**: Only modified data is sent to backend

### Storage Performance

- **Sled Database**: High-performance embedded database
- **Binary Serialization**: Efficient data serialization
- **Indexed Access**: Fast key-based data retrieval

## Security Features

### Data Validation

- **Schema Validation**: All data is validated against JSON Schema
- **Type Safety**: TypeScript provides compile-time type checking
- **Input Sanitization**: Automatic input sanitization and validation

### Access Control

- **Local Storage**: Data is stored locally on the user's machine
- **No Network Transmission**: No sensitive data is transmitted over network
- **Process Isolation**: Tauri provides secure process isolation

## Development Workflow

### Adding New Schemas

1. **Define Schema**: Create JSON Schema definition
2. **Register Schema**: Add schema to backend registration
3. **Create UI**: Use SchemaDataForm component with new schema
4. **Test**: Validate schema and UI functionality

### Extending Functionality

1. **Add Field Types**: Extend SchemaField component for new types
2. **Custom Validation**: Add custom validation rules
3. **UI Enhancements**: Improve form styling and behavior
4. **Backend Features**: Add new Tauri commands as needed

## Best Practices

### Schema Design

- Use descriptive titles and descriptions
- Provide meaningful default values
- Include appropriate validation rules
- Structure nested objects logically

### Component Usage

- Use appropriate mode (appdata vs config)
- Handle all events properly
- Provide proper error handling
- Use TypeScript for type safety

### Performance

- Lazy load schemas when possible
- Debounce validation calls
- Use proper key props for lists
- Avoid unnecessary re-renders

## Future Enhancements

### Planned Features

1. **Advanced Field Types**: Date pickers, file uploads, rich text editors
2. **Conditional Fields**: Dynamic field display based on other values
3. **Array UI Improvements**: Better array field editing interface
4. **Form Templates**: Pre-built form templates for common use cases
5. **Data Import/Export**: CSV, JSON import/export functionality
6. **Offline Support**: Enhanced offline capabilities
7. **Multi-language**: Internationalization support
8. **Advanced Validation**: Custom validation functions

### Technical Improvements

1. **Performance Optimization**: Further performance improvements
2. **Memory Management**: Better memory usage optimization
3. **Error Recovery**: Enhanced error recovery mechanisms
4. **Testing**: Comprehensive test coverage
5. **Documentation**: Enhanced documentation and examples

## Conclusion

The Application Data Management System provides a robust, flexible, and user-friendly solution for managing structured data within the CraftGUI application. By combining schema-based validation, dynamic form generation, and efficient backend storage, it offers a comprehensive data management experience that is both powerful and easy to use.

The system's dual-mode architecture allows it to serve both data management and configuration needs, while its extensible design ensures it can grow with the application's requirements. The integration with Tauri provides secure, high-performance data storage while maintaining the flexibility of web technologies for the user interface.

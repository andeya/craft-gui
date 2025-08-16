# Schema Form Components - Field Layout System

## Overview

This directory contains optimized schema form components with a unified field layout system that supports flexible column configurations for both top-level and nested fields.

## Components

### SchemaApiForm

- **Purpose**: Form component for API parameter configuration
- **Features**:
  - Dynamic field layout based on schema structure
  - Support for nested object fields
  - Validation and submission handling
  - Compact mode support

### SchemaDataForm

- **Purpose**: Form component for data management (appdata/config)
- **Features**:
  - CRUD operations (Create, Read, Update, Delete)
  - Schema selection and key management
  - Same field layout system as SchemaApiForm
  - Modification tracking

### SchemaField

- **Purpose**: Individual field rendering component
- **Features**:
  - Support for all JSON Schema types
  - Nested object field rendering
  - Validation integration
  - Compact mode support

## Field Layout System

### Configuration

Both `SchemaApiForm` and `SchemaDataForm` support the `fieldLayoutConfig` prop:

```typescript
interface FieldLayoutConfig {
  fieldKey?: string; // undefined for first-level fields
  columns: number; // Number of columns for sub-fields
  span?: number; // Grid span for this field (optional)
}
```

### Usage Example

```vue
<SchemaApiForm
  :schema-id="'MySchema'"
  :columns="2"
  :field-layout-config="[
    { fieldKey: undefined, columns: 2 }, // First level: 2 columns
    { fieldKey: 'complexField', columns: 3, span: 2 }, // Complex field: 3 columns, spans 2
    { fieldKey: 'simpleField', columns: 1, span: 1 }, // Simple field: 1 column, spans 1
  ]"
  @submit="handleSubmit"
/>
```

### Layout Logic

1. **Root Container**: Uses `getRootColumns()` to determine main grid columns
2. **Field Spans**: Each field can span multiple columns using `field-span-*` classes
3. **Nested Fields**: Object fields can have their own column configuration
4. **Responsive**: Automatically adjusts to single column on mobile devices

## Shared Utilities

### layout-utils.ts

Contains shared functions for layout calculations:

- `getFieldLayout()` - Find layout config for specific field
- `getRootLayout()` - Get root level layout config
- `getFieldColumns()` - Calculate columns for field
- `getFieldSpan()` - Calculate grid span for field
- `getRootColumns()` - Get root container columns

### layout-styles.css

Shared CSS for consistent styling:

- Grid layout classes
- Field span classes
- Object field styling
- Responsive breakpoints

## Code Quality Improvements

### ✅ Eliminated Code Duplication

- Shared layout utility functions
- Shared CSS styles
- Consistent implementation across components

### ✅ Type Safety

- Proper TypeScript interfaces
- Null-safe operations using `??` operator
- Explicit parameter types

### ✅ Performance Optimization

- Computed properties for layout calculations
- Efficient grid system using CSS Grid
- Minimal re-renders

### ✅ Maintainability

- Single source of truth for layout logic
- Clear separation of concerns
- Comprehensive documentation

## Best Practices

1. **Use `undefined` for root level**: `fieldKey: undefined` for first-level fields
2. **Balance column counts**: Ensure total spans don't exceed available columns
3. **Mobile-first design**: Always test responsive behavior
4. **Consistent naming**: Use descriptive field keys in configuration

## Migration Guide

### From Old Implementation

1. Replace direct layout functions with shared utilities
2. Import shared CSS styles
3. Update field layout configuration syntax
4. Test responsive behavior

### Breaking Changes

- None - all changes are backward compatible
- Existing configurations will continue to work
- New features are opt-in via props

# CraftGUI Documentation Index

Welcome to the CraftGUI Application Data Management System documentation! This directory contains complete documentation for system architecture and component usage.

## 📚 Documentation Directory

### 🏗️ System Architecture Documentation

#### [Application Data Management System](./APP_DATA_MANAGEMENT_SYSTEM.md)

- **Purpose**: System-level architecture design documentation
- **Audience**: System architects, developers understanding overall architecture
- **Content**:
  - System architecture overview
  - Data flow design
  - Core component introduction
  - Backend integration instructions
  - Schema system design
  - Best practices guide

### 🧩 Component Usage Documentation

#### [SchemaDataForm Component](./SCHEMA_DATA_FORM.md)

- **Purpose**: Data management (CRUD) form component
- **Audience**: Developers using data management functionality
- **Content**:
  - Component overview and features
  - Props properties and Events
  - Basic usage and advanced usage
  - Configuration mode and dynamic schema selection
  - Diff comparison functionality
  - Exposed methods and best practices

#### [SchemaApiForm Component](./SCHEMA_API_FORM.md)

- **Purpose**: API interface call form component
- **Audience**: Developers using API call functionality
- **Content**:
  - Component overview and features
  - Props properties and Events
  - Basic usage and advanced usage
  - Custom buttons and layout
  - Pre-fill data and handle validation errors
  - Exposed methods and best practices

#### [SchemaField Component](./SCHEMA_FIELD.md)

- **Purpose**: Universal form field rendering component
- **Audience**: Developers understanding field rendering mechanisms
- **Content**:
  - Component overview and features
  - Supported data types
  - Props properties and Events
  - Field type examples
  - Advanced usage and style customization
  - Best practices and common questions

## 🎯 Quick Start

### New User Guide

1. **Understand System Architecture**: First read [Application Data Management System](./APP_DATA_MANAGEMENT_SYSTEM.md) to understand overall design
2. **Choose Usage Scenario**:
   - Data management scenarios → View [SchemaDataForm](./SCHEMA_DATA_FORM.md)
   - API call scenarios → View [SchemaApiForm](./SCHEMA_API_FORM.md)
3. **Deep Dive into Field Rendering**: If you need to customize fields → View [SchemaField](./SCHEMA_FIELD.md)

### Developer Guide

1. **System Integration**: Reference architecture documentation for system integration
2. **Component Usage**: Choose appropriate components based on specific requirements
3. **Custom Development**: Reference component documentation for extension development

## 🔧 Technology Stack

- **Frontend**: Vue 3 + TypeScript + Quasar Framework
- **Backend**: Rust + Tauri
- **Data Storage**: Sled (embedded database)
- **Schema Validation**: JSON Schema 2020-12
- **UI Components**: Quasar UI Components

## 📋 Component Comparison

| Component      | Purpose               | Data Persistence | Layout Support | Change Tracking | Diff Comparison |
| -------------- | --------------------- | ---------------- | -------------- | --------------- | --------------- |
| SchemaDataForm | Data Management(CRUD) | ✅               | ✅             | ✅              | ✅              |
| SchemaApiForm  | API Interface Calls   | ❌               | ✅             | ❌              | ❌              |
| SchemaField    | Field Rendering       | -                | ✅             | ✅              | -               |

## 🚀 Example Project

View `src/pages/004.appdata-demo.vue` to understand complete usage examples, including:

- Basic usage of SchemaDataForm
- Configuration and layout of SchemaApiForm
- Dynamic schema selection
- Event handling and error handling

## 📖 Related Resources

- [JSON Schema Specification](https://json-schema.org/)
- [Quasar Framework Documentation](https://quasar.dev/)
- [Tauri Documentation](https://tauri.app/)
- [Vue 3 Documentation](https://vuejs.org/)

## 🤝 Contribution Guidelines

To improve documentation or add new features:

1. Update corresponding component documentation
2. Update system architecture documentation (if architecture changes are involved)
3. Update this index documentation
4. Ensure consistency and accuracy of documentation

## 📞 Support

For questions or suggestions, please:

1. Check the common questions section of relevant components
2. Reference example project code
3. Submit Issue or Pull Request

---

**Last Updated**: December 2024
**Version**: 1.0.0

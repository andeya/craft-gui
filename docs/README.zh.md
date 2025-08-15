# CraftGUI 文档索引

欢迎使用 CraftGUI 应用数据管理系统文档！本目录包含了系统架构和组件使用的完整文档。

## 📚 文档目录

### 🏗️ 系统架构文档

#### [应用数据管理系统](./APP_DATA_MANAGEMENT_SYSTEM.md)

- **用途**: 系统级架构设计文档
- **受众**: 系统架构师、开发者理解整体架构
- **内容**:
  - 系统架构概述
  - 数据流设计
  - 核心组件介绍
  - 后端集成说明
  - Schema 系统设计
  - 最佳实践指南

### 🧩 组件使用文档

#### [SchemaDataForm 组件](./SCHEMA_DATA_FORM.md)

- **用途**: 数据管理(CRUD)表单组件
- **受众**: 开发者使用数据管理功能
- **内容**:
  - 组件概述和特性
  - Props 属性和 Events 事件
  - 基本用法和高级用法
  - 配置模式和动态 Schema 选择
  - 差异对比功能
  - 暴露的方法和最佳实践

#### [SchemaApiForm 组件](./SCHEMA_API_FORM.md)

- **用途**: API 接口调用表单组件
- **受众**: 开发者使用 API 调用功能
- **内容**:
  - 组件概述和特性
  - Props 属性和 Events 事件
  - 基本用法和高级用法
  - 自定义按钮和布局
  - 预填充数据和处理验证错误
  - 暴露的方法和最佳实践

#### [SchemaField 组件](./SCHEMA_FIELD.md)

- **用途**: 通用表单字段渲染组件
- **受众**: 开发者理解字段渲染机制
- **内容**:
  - 组件概述和特性
  - 支持的数据类型
  - Props 属性和 Events 事件
  - 字段类型示例
  - 高级用法和样式定制
  - 最佳实践和常见问题

## 🎯 快速开始

### 新用户指南

1. **了解系统架构**: 首先阅读 [应用数据管理系统](./APP_DATA_MANAGEMENT_SYSTEM.md) 了解整体设计
2. **选择使用场景**:
   - 数据管理场景 → 查看 [SchemaDataForm](./SCHEMA_DATA_FORM.md)
   - API 调用场景 → 查看 [SchemaApiForm](./SCHEMA_API_FORM.md)
3. **深入字段渲染**: 如需自定义字段 → 查看 [SchemaField](./SCHEMA_FIELD.md)

### 开发者指南

1. **系统集成**: 参考架构文档进行系统集成
2. **组件使用**: 根据具体需求选择合适的组件
3. **自定义开发**: 参考组件文档进行扩展开发

## 🔧 技术栈

- **前端**: Vue 3 + TypeScript + Quasar Framework
- **后端**: Rust + Tauri
- **数据存储**: Sled (嵌入式数据库)
- **Schema 验证**: JSON Schema 2020-12
- **UI 组件**: Quasar UI Components

## 📋 组件对比

| 组件           | 用途           | 数据持久化 | 布局支持 | 变更追踪 | 差异对比 |
| -------------- | -------------- | ---------- | -------- | -------- | -------- |
| SchemaDataForm | 数据管理(CRUD) | ✅         | ✅       | ✅       | ✅       |
| SchemaApiForm  | API 接口调用   | ❌         | ✅       | ❌       | ❌       |
| SchemaField    | 字段渲染       | -          | ✅       | ✅       | -        |

## 🚀 示例项目

查看 `src/pages/004.appdata-demo.vue` 了解完整的使用示例，包括：

- SchemaDataForm 的基本使用
- SchemaApiForm 的配置和布局
- 动态 Schema 选择
- 事件处理和错误处理

## 📖 相关资源

- [JSON Schema 规范](https://json-schema.org/)
- [Quasar Framework 文档](https://quasar.dev/)
- [Tauri 文档](https://tauri.app/)
- [Vue 3 文档](https://vuejs.org/)

## 🤝 贡献指南

如需改进文档或添加新功能：

1. 更新相应的组件文档
2. 更新系统架构文档（如涉及架构变更）
3. 更新本索引文档
4. 确保文档的一致性和准确性

## 📞 支持

如有问题或建议，请：

1. 查看相关组件的常见问题部分
2. 参考示例项目代码
3. 提交 Issue 或 Pull Request

---

**最后更新**: 2024 年 12 月
**版本**: 1.0.0

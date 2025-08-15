# SchemaApiForm 组件使用指南

## 概述

`SchemaApiForm` 是一个专门用于 API 接口调用的表单组件，它通过指定的 schema 名称加载 schema 定义，并展示基于 schema 默认值的表单字段，提供表单验证和提交功能。

## 主要特性

- 🔄 **动态 Schema 加载**: 通过 schema 名称自动加载 schema 定义
- 📝 **默认值支持**: 自动使用 schema 中定义的默认值初始化表单
- ✅ **表单验证**: 基于 schema 规则进行实时验证
- 🎨 **可定制 UI**: 支持自定义按钮文本、图标和布局
- 📱 **响应式设计**: 支持紧凑模式和智能网格布局
- 🎯 **智能布局**: 字段组件内部实现布局逻辑，单个字段自动居中显示
- 🔔 **事件回调**: 提供完整的成功/失败回调函数

## 基本用法

```vue
<template>
  <SchemaApiForm
    schema-name="user_profile"
    @submit="handleSubmit"
    @submit-success="handleSuccess"
    @submit-error="handleError"
  />
</template>

<script setup lang="ts">
const handleSubmit = (data: Record<string, any>) => {
  console.log("Form submitted:", data);
  // 处理表单提交逻辑
};

const handleSuccess = (data: Record<string, any>) => {
  console.log("Submit success:", data);
};

const handleError = (error: string) => {
  console.error("Submit error:", error);
};
</script>
```

## Props 属性

| 属性名             | 类型                  | 默认值     | 说明                                     |
| ------------------ | --------------------- | ---------- | ---------------------------------------- |
| `schemaName`       | `string`              | -          | **必需** - Schema 名称                   |
| `initialData`      | `Record<string, any>` | `{}`       | 初始表单数据（会覆盖 schema 默认值）     |
| `showHeader`       | `boolean`             | `true`     | 是否显示表单头部                         |
| `showCancelButton` | `boolean`             | `true`     | 是否显示取消按钮                         |
| `submitButtonText` | `string`              | `"Submit"` | 提交按钮文本                             |
| `submitButtonIcon` | `string`              | `"send"`   | 提交按钮图标                             |
| `cancelButtonText` | `string`              | `"Cancel"` | 取消按钮文本                             |
| `cancelButtonIcon` | `string`              | `"close"`  | 取消按钮图标                             |
| `gridColumns`      | `number`              | `2`        | 表单字段网格列数（1-4）                  |
| `columns`          | `number`              | `0`        | 字段列布局（0=auto, 1=single, 2=double） |
| `compact`          | `boolean`             | `false`    | 是否使用紧凑模式                         |

## Events 事件

| 事件名               | 参数                          | 说明                  |
| -------------------- | ----------------------------- | --------------------- |
| `submit`             | `data: Record<string, any>`   | 表单提交时触发        |
| `submit-success`     | `data: Record<string, any>`   | 提交成功时触发        |
| `submit-error`       | `error: string`               | 提交失败时触发        |
| `cancel`             | -                             | 取消操作时触发        |
| `validation-error`   | `errors: Map<string, string>` | 验证失败时触发        |
| `validation-success` | -                             | 验证通过时触发        |
| `schema-loaded`      | `schema: AppSchema`           | Schema 加载成功时触发 |
| `schema-error`       | `error: string`               | Schema 加载失败时触发 |

## 高级用法

### 自定义按钮和布局

```vue
<template>
  <SchemaApiForm
    schema-name="product_config"
    :submit-button-text="'Create Product'"
    :submit-button-icon="'add_shopping_cart'"
    :cancel-button-text="'Back'"
    :cancel-button-icon="'arrow_back'"
    :grid-columns="3"
    :compact="true"
    @submit="createProduct"
  />
</template>
```

### 预填充数据

```vue
<template>
  <SchemaApiForm
    schema-name="user_profile"
    :initial-data="{
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
    }"
    @submit="updateProfile"
  />
</template>
```

### 处理验证错误

```vue
<template>
  <SchemaApiForm
    schema-name="order_form"
    @validation-error="handleValidationErrors"
    @submit="placeOrder"
  />
</template>

<script setup lang="ts">
const handleValidationErrors = (errors: Map<string, string>) => {
  console.log("Validation errors:", errors);
  // 可以显示自定义错误消息或进行其他处理
};
</script>
```

## 暴露的方法

组件暴露了以下方法供父组件调用：

```vue
<template>
  <SchemaApiForm ref="apiFormRef" schema-name="test_schema" />
</template>

<script setup lang="ts">
import { ref } from "vue";

const apiFormRef = ref();

// 获取当前表单数据
const getData = () => {
  const data = apiFormRef.value.getFormData();
  console.log("Current form data:", data);
};

// 设置表单数据
const setData = () => {
  apiFormRef.value.setFormData({
    field1: "value1",
    field2: "value2",
  });
};

// 手动验证表单
const validate = () => {
  const isValid = apiFormRef.value.validate();
  console.log("Form is valid:", isValid);
};

// 手动提交表单
const submit = () => {
  apiFormRef.value.submit();
};

// 重置表单到初始状态
const reset = () => {
  apiFormRef.value.reset();
};

// 重新加载schema
const reloadSchema = () => {
  apiFormRef.value.loadSchema();
};
</script>
```

## 与 SchemaDataForm 的区别

| 特性            | SchemaApiForm         | SchemaDataForm        |
| --------------- | --------------------- | --------------------- |
| **用途**        | API 接口调用          | 数据管理(CRUD)        |
| **数据持久化**  | ❌ 不持久化           | ✅ 支持持久化         |
| **Schema 加载** | ✅ 自动加载           | ✅ 自动加载           |
| **默认值**      | ✅ 使用 schema 默认值 | ✅ 使用 schema 默认值 |
| **表单验证**    | ✅ 实时验证           | ✅ 实时验证           |
| **按钮定制**    | ✅ 高度可定制         | ⚠️ 部分可定制         |
| **网格布局**    | ✅ 支持 1-4 列        | ❌ 固定布局           |
| **紧凑模式**    | ✅ 支持               | ✅ 支持               |

## 最佳实践

1. **Schema 设计**: 确保 schema 中定义了合适的默认值和验证规则
2. **错误处理**: 始终处理 `submit-error` 和 `validation-error` 事件
3. **用户体验**: 使用合适的按钮文本和图标来提升用户体验
4. **响应式设计**: 根据屏幕尺寸调整 `gridColumns` 属性
5. **性能优化**: 对于复杂表单，考虑使用 `compact` 模式

## 示例场景

### 用户注册表单

```vue
<SchemaApiForm
  schema-name="user_registration"
  :submit-button-text="'Create Account'"
  :submit-button-icon="'person_add'"
  :grid-columns="2"
  @submit="registerUser"
/>
```

### 产品配置表单

```vue
<SchemaApiForm
  schema-name="product_configuration"
  :submit-button-text="'Save Configuration'"
  :submit-button-icon="'settings'"
  :grid-columns="3"
  :compact="true"
  @submit="saveProductConfig"
/>
```

### API 调用表单

```vue
<SchemaApiForm
  schema-name="api_request"
  :submit-button-text="'Send Request'"
  :submit-button-icon="'send'"
  :show-cancel-button="false"
  @submit="sendApiRequest"
/>
```

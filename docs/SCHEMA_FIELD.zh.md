# SchemaField 组件使用指南

## 概述

`SchemaField` 是一个通用的表单字段渲染组件，它根据 JSON Schema 定义自动渲染相应的表单控件，支持多种数据类型和验证规则。该组件是 SchemaDataForm 和 SchemaApiForm 的核心字段渲染器。

## 主要特性

- 🔄 **动态字段渲染**: 根据 JSON Schema 自动渲染相应的表单控件
- 📝 **多类型支持**: 支持字符串、数字、布尔值、对象、数组等类型
- ✅ **自动验证**: 基于 schema 规则进行实时验证
- 🎨 **可定制样式**: 支持紧凑模式和自定义样式
- 🔍 **变更追踪**: 可视化显示字段修改状态
- 📱 **响应式设计**: 支持不同的布局模式
- 🎯 **智能布局**: 单个字段自动居中显示

## 支持的数据类型

### 1. 字符串类型 (string)

- **普通文本输入**: 单行文本输入框
- **选择下拉框**: 当 schema 定义了 `enum` 时
- **验证规则**: `minLength`、`maxLength`、`pattern` 等

### 2. 数字类型 (integer/number)

- **数字输入框**: 支持整数和小数
- **范围验证**: `minimum`、`maximum` 等
- **步长控制**: `multipleOf` 等

### 3. 布尔类型 (boolean)

- **开关控件**: 使用 QToggle 组件
- **复选框**: 在紧凑模式下使用

### 4. 对象类型 (object)

- **嵌套表单**: 递归渲染子字段
- **对象验证**: 支持 `required` 字段验证

### 5. 数组类型 (array)

- **JSON 编辑**: 使用文本域编辑 JSON 数组
- **数组验证**: 支持 `minItems`、`maxItems` 等

## 基本用法

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
  title: "姓名",
  description: "请输入您的姓名",
  minLength: 1,
  maxLength: 100,
};

const fieldValue = ref("张三");
const isFieldModified = ref(false);

const handleValueChange = (value: any) => {
  fieldValue.value = value;
};

const handleValidationError = (error: string) => {
  console.error("验证错误:", error);
};

const handleValidationSuccess = () => {
  console.log("验证通过");
};
</script>
```

## Props 属性

| 属性名                    | 类型                                               | 默认值        | 说明                               |
| ------------------------- | -------------------------------------------------- | ------------- | ---------------------------------- |
| `schema`                  | `AppSchema`                                        | -             | **必需** - 字段的 JSON Schema 定义 |
| `modelValue`              | `FieldValue`                                       | -             | **必需** - 字段的当前值            |
| `rootSchema`              | `AppSchema \| null`                                | `null`        | 根 schema（用于解析 $ref）         |
| `isModified`              | `boolean`                                          | `false`       | 字段是否已被修改                   |
| `parentKey`               | `string`                                           | `""`          | 父字段的键名                       |
| `checkNestedModification` | `(parentKey: string, childKey: string) => boolean` | `() => false` | 检查嵌套字段修改状态的函数         |
| `compact`                 | `boolean`                                          | `false`       | 是否使用紧凑模式                   |

## Events 事件

| 事件名               | 参数                | 说明             |
| -------------------- | ------------------- | ---------------- |
| `update:model-value` | `value: FieldValue` | 字段值更新时触发 |
| `validation-error`   | `error: string`     | 验证失败时触发   |
| `validation-success` | -                   | 验证通过时触发   |

## 字段类型示例

### 字符串字段

```typescript
const stringSchema: AppSchema = {
  type: "string",
  title: "邮箱地址",
  description: "请输入您的邮箱地址",
  format: "email",
  minLength: 5,
  maxLength: 100,
};
```

### 数字字段

```typescript
const numberSchema: AppSchema = {
  type: "integer",
  title: "年龄",
  description: "请输入您的年龄",
  minimum: 0,
  maximum: 150,
};
```

### 布尔字段

```typescript
const booleanSchema: AppSchema = {
  type: "boolean",
  title: "是否激活",
  description: "用户是否处于激活状态",
};
```

### 选择字段

```typescript
const selectSchema: AppSchema = {
  type: "string",
  title: "国家",
  description: "请选择您的国家",
  enum: ["中国", "美国", "加拿大", "英国", "德国", "法国"],
};
```

### 对象字段

```typescript
const objectSchema: AppSchema = {
  type: "object",
  title: "地址",
  description: "请输入您的地址",
  properties: {
    street: {
      type: "string",
      title: "街道地址",
    },
    city: {
      type: "string",
      title: "城市",
    },
    zipCode: {
      type: "string",
      title: "邮政编码",
    },
  },
  required: ["street", "city"],
};
```

### 数组字段

```typescript
const arraySchema: AppSchema = {
  type: "array",
  title: "标签",
  description: "请输入标签（JSON 数组格式）",
  items: {
    type: "string",
  },
  minItems: 1,
  maxItems: 10,
};
```

## 高级用法

### 嵌套对象渲染

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
  title: "地址",
  properties: {
    street: {
      type: "string",
      title: "街道",
      required: true,
    },
    city: {
      type: "string",
      title: "城市",
      required: true,
    },
    country: {
      type: "string",
      title: "国家",
      enum: ["中国", "美国", "加拿大"],
    },
  },
};

const addressValue = ref({
  street: "中关村大街1号",
  city: "北京",
  country: "中国",
});

const checkNestedModification = (parentKey: string, childKey: string) => {
  // 检查嵌套字段是否被修改
  return false;
};
</script>
```

### 自定义验证规则

```typescript
// Schema 中定义的验证规则会自动应用
const customValidationSchema: AppSchema = {
  type: "string",
  title: "电话号码",
  description: "请输入电话号码",
  pattern: "^\\+?[1-9]\\d{1,14}$", // 国际电话号码格式
  minLength: 10,
  maxLength: 15,
};
```

### 紧凑模式

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

## 样式定制

### 紧凑模式样式

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

### 修改状态指示

```css
.field-input-wrapper.field-modified {
  border-left: 3px solid #ffc107;
  padding-left: 8px;
  border-radius: 3px;
}
```

### 验证错误样式

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

## 最佳实践

### 1. Schema 设计

```typescript
// 好的 schema 设计
const goodSchema: AppSchema = {
  type: "string",
  title: "用户名", // 提供清晰的标题
  description: "请输入您的姓名", // 提供描述
  minLength: 1, // 设置最小长度
  maxLength: 50, // 设置最大长度
  pattern: "^[a-zA-Z\\s]+$", // 设置格式验证
};

// 避免的设计
const badSchema: AppSchema = {
  type: "string", // 缺少标题和描述
  // 没有验证规则
};
```

### 2. 错误处理

```vue
<script setup lang="ts">
const handleValidationError = (error: string) => {
  // 记录错误日志
  console.error("字段验证错误:", error);

  // 显示用户友好的错误消息
  showNotification({
    type: "negative",
    message: error,
  });
};

const handleValidationSuccess = () => {
  // 清除错误状态
  clearFieldError();
};
</script>
```

### 3. 性能优化

```vue
<script setup lang="ts">
// 使用 computed 来优化性能
const fieldDisplayName = computed(() => {
  return props.schema.title || "字段";
});

// 使用 watch 来处理值变化
watch(
  () => props.modelValue,
  (newValue) => {
    // 处理值变化逻辑
  },
  { immediate: true }
);
</script>
```

## 常见问题

### Q: 如何处理复杂的嵌套对象？

A: SchemaField 会自动递归渲染嵌套对象。确保在 schema 中正确定义 `properties` 和 `required` 字段。

### Q: 如何自定义字段的渲染逻辑？

A: 可以通过扩展 SchemaField 组件或创建自定义字段组件来实现。SchemaField 支持通过 `type` 字段来区分不同的渲染逻辑。

### Q: 如何处理数组类型的字段？

A: 当前版本使用 JSON 文本域来编辑数组。未来版本可能会提供更友好的数组编辑界面。

### Q: 如何添加自定义验证规则？

A: 在 JSON Schema 中使用 `pattern`、`format` 等字段来定义验证规则。SchemaField 会自动应用这些规则。

## 扩展开发

### 添加新的字段类型

```typescript
// 在 SchemaField 组件中添加新的类型支持
const isCustomType = computed((): boolean => {
  return resolvedSchema.value.type === "custom";
});

// 在模板中添加渲染逻辑
<div v-if="isCustomType" class="custom-field">
  <!-- 自定义字段渲染逻辑 -->
</div>
```

### 自定义验证逻辑

```typescript
// 在 validationRules computed 中添加自定义验证
const validationRules = computed((): ValidationRule[] => {
  const rules: ValidationRule[] = [];

  // 添加自定义验证规则
  if (resolvedSchema.value.customValidation) {
    rules.push((val: any) => {
      // 自定义验证逻辑
      return customValidationFunction(val) || "自定义验证失败";
    });
  }

  return rules;
});
```

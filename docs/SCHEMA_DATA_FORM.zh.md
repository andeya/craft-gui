# SchemaDataForm 组件使用指南

## 概述

`SchemaDataForm` 是一个专门用于数据管理(CRUD)的表单组件，它通过指定的 schema 名称加载 schema 定义，支持数据的创建、读取、更新和删除操作，并提供数据持久化功能。

## 主要特性

- 🔄 **动态 Schema 加载**: 通过 schema 名称自动加载 schema 定义
- 💾 **数据持久化**: 支持数据的保存、加载、删除操作
- 📝 **CRUD 操作**: 完整的创建、读取、更新、删除功能
- ✅ **表单验证**: 基于 schema 规则进行实时验证
- 🎨 **可定制 UI**: 支持自定义按钮、标题和描述
- 📱 **响应式设计**: 支持紧凑模式和智能网格布局
- 🔍 **变更追踪**: 可视化显示字段修改状态
- 📊 **差异对比**: 保存前显示数据变更对比
- 🎯 **智能布局**: 字段组件内部实现布局逻辑，单个字段自动居中显示

## 基本用法

```vue
<template>
  <SchemaDataForm
    schema-name="UserProfile"
    :data-key="1"
    title="用户档案管理"
    description="管理用户档案数据"
    @save="handleSave"
    @load="handleLoad"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
const handleSave = (data: Record<string, any>) => {
  console.log("数据已保存:", data);
};

const handleLoad = (data: Record<string, any>) => {
  console.log("数据已加载:", data);
};

const handleDelete = () => {
  console.log("数据已删除");
};
</script>
```

## Props 属性

| 属性名               | 类型                            | 默认值      | 说明                                               |
| -------------------- | ------------------------------- | ----------- | -------------------------------------------------- |
| `schemaName`         | `string`                        | -           | Schema 名称                                        |
| `dataKey`            | `number`                        | `1`         | 数据键值（用于标识数据记录）                       |
| `title`              | `string`                        | -           | 表单标题                                           |
| `description`        | `string`                        | -           | 表单描述                                           |
| `showHeader`         | `boolean`                       | `true`      | 是否显示表单头部                                   |
| `compact`            | `boolean`                       | `true`      | 是否使用紧凑模式                                   |
| `columns`            | `number`                        | `0`         | 字段列布局（0=auto, 1=single, 2=double, 3=triple） |
| `showSaveButton`     | `boolean`                       | `true`      | 是否显示保存按钮                                   |
| `showDeleteButton`   | `boolean`                       | `true`      | 是否显示删除按钮                                   |
| `showNewButton`      | `boolean`                       | `true`      | 是否显示新建按钮                                   |
| `showReloadButton`   | `boolean`                       | `true`      | 是否显示重新加载按钮                               |
| `availableSchemas`   | `SchemaOption[]`                | `[]`        | 可用的 schema 选项                                 |
| `mode`               | `'appdata' \| 'config'`         | `'appdata'` | 运行模式                                           |
| `showDiffBeforeSave` | `boolean \| string \| function` | -           | 保存前是否显示差异对比                             |

## Events 事件

| 事件名               | 参数                          | 说明              |
| -------------------- | ----------------------------- | ----------------- |
| `save`               | `data: Record<string, any>`   | 数据保存时触发    |
| `load`               | `data: Record<string, any>`   | 数据加载时触发    |
| `delete`             | -                             | 数据删除时触发    |
| `reload`             | -                             | 重新加载时触发    |
| `create`             | `data: Record<string, any>`   | 新建数据时触发    |
| `prepare`            | `data: Record<string, any>`   | 准备新建时触发    |
| `reset`              | `data: Record<string, any>`   | 重置表单时触发    |
| `schema-change`      | `schemaName: string`          | Schema 变更时触发 |
| `key-change`         | `key: number`                 | 数据键变更时触发  |
| `validation-error`   | `errors: Map<string, string>` | 验证失败时触发    |
| `validation-success` | -                             | 验证通过时触发    |
| `notify`             | `notification: object`        | 通知事件          |

## 高级用法

### 配置模式

```vue
<template>
  <SchemaDataForm
    mode="config"
    schema-name="AppConfig"
    title="应用设置"
    description="配置应用设置"
    :show-delete-button="false"
    :show-new-button="false"
    @save="handleConfigSave"
  />
</template>
```

### 动态 Schema 选择

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
  { name: "UserProfile", title: "用户档案" },
  { name: "ProductConfig", title: "产品配置" },
  { name: "SystemSettings", title: "系统设置" },
];

const currentKey = ref(1);

const handleSchemaChange = (schemaName: string) => {
  console.log("Schema 已更改为:", schemaName);
};

const handleKeyChange = (key: number) => {
  console.log("键值已更改为:", key);
};
</script>
```

### 差异对比功能

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

### 自定义布局

```vue
<template>
  <SchemaDataForm
    schema-name="ProductConfig"
    :data-key="1"
    :columns="2"
    :compact="false"
    title="产品配置"
    @save="handleSave"
  />
</template>
```

## 暴露的方法

组件暴露了以下方法供父组件调用：

```vue
<template>
  <SchemaDataForm ref="dataFormRef" schema-name="test_schema" />
</template>

<script setup lang="ts">
import { ref } from "vue";

const dataFormRef = ref();

// 获取当前表单数据
const getData = () => {
  const data = dataFormRef.value.getFormData();
  console.log("当前表单数据:", data);
};

// 设置表单数据
const setData = () => {
  dataFormRef.value.setFormData({
    field1: "value1",
    field2: "value2",
  });
};

// 手动验证表单
const validate = () => {
  const isValid = dataFormRef.value.validate();
  console.log("表单是否有效:", isValid);
};

// 手动保存数据
const save = () => {
  dataFormRef.value.save();
};

// 手动加载数据
const load = () => {
  dataFormRef.value.load();
};

// 手动删除数据
const deleteData = () => {
  dataFormRef.value.delete();
};

// 重置表单到初始状态
const reset = () => {
  dataFormRef.value.reset();
};

// 创建新数据
const createNew = () => {
  dataFormRef.value.createNew();
};
</script>
```

## 与 SchemaApiForm 的区别

| 特性            | SchemaDataForm        | SchemaApiForm         |
| --------------- | --------------------- | --------------------- |
| **用途**        | 数据管理(CRUD)        | API 接口调用          |
| **数据持久化**  | ✅ 支持持久化         | ❌ 不持久化           |
| **Schema 加载** | ✅ 自动加载           | ✅ 自动加载           |
| **默认值**      | ✅ 使用 schema 默认值 | ✅ 使用 schema 默认值 |
| **表单验证**    | ✅ 实时验证           | ✅ 实时验证           |
| **按钮定制**    | ⚠️ 部分可定制         | ✅ 高度可定制         |
| **网格布局**    | ❌ 固定布局           | ✅ 支持 1-4 列        |
| **紧凑模式**    | ✅ 支持               | ✅ 支持               |
| **变更追踪**    | ✅ 支持               | ❌ 不支持             |
| **差异对比**    | ✅ 支持               | ❌ 不支持             |

## 最佳实践

1. **数据键管理**: 使用有意义的数字键来标识不同的数据记录
2. **Schema 设计**: 确保 schema 中定义了合适的默认值和验证规则
3. **错误处理**: 始终处理 `validation-error` 和 `notify` 事件
4. **用户体验**: 使用合适的标题和描述来提升用户体验
5. **性能优化**: 对于复杂表单，考虑使用 `compact` 模式
6. **数据备份**: 重要数据操作前考虑备份机制

## 示例场景

### 用户档案管理

```vue
<SchemaDataForm
  schema-name="UserProfile"
  :data-key="1"
  title="用户档案管理"
  description="管理用户档案信息"
  :columns="2"
  @save="handleUserSave"
  @load="handleUserLoad"
  @delete="handleUserDelete"
/>
```

### 产品配置管理

```vue
<SchemaDataForm
  schema-name="ProductConfig"
  :data-key="currentProductId"
  title="产品配置"
  description="配置产品设置和参数"
  :compact="true"
  @save="handleProductSave"
/>
```

### 系统设置管理

```vue
<SchemaDataForm
  mode="config"
  schema-name="SystemSettings"
  title="系统设置"
  description="配置系统级设置"
  :show-delete-button="false"
  :show-new-button="false"
  @save="handleSystemSave"
/>
```

### 多记录管理

```vue
<template>
  <div>
    <div class="q-mb-md">
      <QBtn
        v-for="key in [1, 2, 3, 4, 5]"
        :key="key"
        :label="`记录 ${key}`"
        :color="currentKey === key ? 'primary' : 'grey'"
        @click="currentKey = key"
        class="q-mr-sm"
      />
    </div>

    <SchemaDataForm
      schema-name="UserProfile"
      :data-key="currentKey"
      title="用户档案管理"
      @save="handleSave"
      @load="handleLoad"
    />
  </div>
</template>

<script setup lang="ts">
const currentKey = ref(1);
</script>
```

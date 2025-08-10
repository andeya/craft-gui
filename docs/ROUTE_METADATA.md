# Route Metadata System

This project uses an automatic route generation system that collects metadata from individual Vue components.

## How It Works

Each Vue component in the `src/views/` directory can export metadata that will be automatically collected and used for:

- Route generation
- Menu item creation
- Page titles
- Icons
- Menu ordering

## Adding a New Page

To add a new page, simply create a `.vue` file in the `src/views/` directory:

```vue
<template>
  <q-page class="q-pa-md">
    <h1>My New Page</h1>
    <!-- Your page content -->
  </q-page>
</template>

<script setup lang="ts">
// Your component logic
</script>

<script lang="ts">
// Route metadata
export const meta = {
  title: "My New Page",
  icon: "article",
  showInMenu: true,
  description: "Description of my new page",
  order: 7,
};
</script>
```

## Metadata Properties

| Property      | Type    | Required | Description                                        |
| ------------- | ------- | -------- | -------------------------------------------------- |
| `title`       | string  | Yes      | Page title displayed in menu and browser           |
| `icon`        | string  | Yes      | Material Design icon name                          |
| `showInMenu`  | boolean | No       | Whether to show in navigation menu (default: true) |
| `description` | string  | No       | Page description for SEO or tooltips               |
| `order`       | number  | No       | Menu ordering (lower numbers appear first)         |

## File Path to Route Mapping

| File Path                               | Route Path                 | Example                  |
| --------------------------------------- | -------------------------- | ------------------------ |
| `src/views/index.vue`                   | `/`                        | Home page                |
| `src/views/api.vue`                     | `/api`                     | API page                 |
| `src/views/user-profile.vue`            | `/user-profile`            | User profile page        |
| `src/views/admin/index.vue`             | `/admin`                   | Admin index page         |
| `src/views/admin/users.vue`             | `/admin/users`             | Admin users page         |
| `src/views/admin/settings.vue`          | `/admin/settings`          | Admin settings page      |
| `src/views/admin/reports/analytics.vue` | `/admin/reports/analytics` | Nested subdirectory page |

## Icon Names

Use Material Design icon names from [Material Icons](https://fonts.google.com/icons):

- `home` - Home icon
- `dashboard` - Dashboard icon
- `settings` - Settings icon
- `person` - User icon
- `info` - Information icon
- `api` - API icon
- `account_circle` - Profile icon
- `bug_report` - Debug icon

## Examples

### Basic Page

```vue
<script lang="ts">
export const meta = {
  title: "Simple Page",
  icon: "article",
  showInMenu: true,
  order: 10,
};
</script>
```

### Hidden Page (not in menu)

```vue
<script lang="ts">
export const meta = {
  title: "Hidden Page",
  icon: "visibility_off",
  showInMenu: false,
  order: 999,
};
</script>
```

### Admin Page

```vue
<script lang="ts">
export const meta = {
  title: "Admin Panel",
  icon: "admin_panel_settings",
  showInMenu: true,
  description: "Administrative functions",
  order: 1,
};
</script>
```

## Subdirectory Support

The system fully supports nested subdirectories. You can organize your views in any directory structure:

```
src/views/
├── index.vue                       # /
├── api.vue                         # /api
├── admin/
│   ├── index.vue                   # /admin
│   ├── users.vue                   # /admin/users
│   ├── settings.vue                # /admin/settings
│   └── reports/
│       └── analytics.vue           # /admin/reports/analytics
└── user/
    ├── profile.vue                 # /user/profile
    └── settings.vue                # /user/settings
```

### Subdirectory Benefits

- **Organized Structure**: Group related pages together
- **Logical Hierarchy**: Reflects your application's structure
- **Scalable**: Easy to add new sections without cluttering
- **Maintainable**: Related functionality stays together
- **Proper Routing**: All paths are correctly prefixed with "/"

### Path Generation Rules

The system automatically generates proper Vue Router paths:

1. **Root Path**: `src/views/index.vue` → `/`
2. **Simple Path**: `src/views/api.vue` → `/api`
3. **Subdirectory**: `src/views/admin/users.vue` → `/admin/users`
4. **Deep Nesting**: `src/views/admin/reports/analytics.vue` → `/admin/reports/analytics`
5. **Index Files**: `src/views/admin/index.vue` → `/admin`

## Benefits

1. **Decentralized Configuration**: Each page manages its own metadata
2. **Type Safety**: Full TypeScript support with interfaces
3. **Automatic Generation**: No manual route configuration needed
4. **Flexible**: Easy to add new properties to metadata
5. **Maintainable**: Changes to one page don't affect others
6. **Subdirectory Support**: Organize pages in logical directory structures

## Debugging

Visit `/debug-routes` to see all generated routes and metadata (this page is hidden from the menu by default).

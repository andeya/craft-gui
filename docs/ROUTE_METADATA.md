# Route Metadata System

This project uses an automatic route generation system that collects metadata from individual Vue components.

## Route Sorting and Matching

The system automatically sorts routes to ensure proper Vue Router matching order:

### Sorting Priority (from highest to lowest)

1. **Root Route (`/`)** - Always first to ensure homepage accessibility
2. **Static Routes** - Before dynamic routes to avoid conflicts
3. **More Specific Paths** - Before less specific paths
4. **Alphabetical Order** - For consistent ordering within same specificity

### Example Sorting

```typescript
// Input routes (unsorted)
[
  "/admin/users",
  "/admin/:id",
  "/",
  "/about",
  "/admin",
  "/user/:id",
  "/user/profile",
][
  // Output routes (sorted)
  ("/", // Root route (highest priority)
  "/admin/users", // Static, 2 segments
  "/user/profile", // Static, 2 segments
  "/admin/:id", // Dynamic, 2 segments
  "/user/:id", // Dynamic, 2 segments
  "/about", // Static, 1 segment
  "/admin") // Static, 1 segment
];
```

### Why This Matters

- **Vue Router uses "First Match Wins"** - routes are matched in order
- **Prevents route conflicts** - specific static routes won't be blocked by dynamic routes
- **Ensures homepage accessibility** - root route is always accessible
- **Improves user experience** - predictable navigation behavior
- **Correct priority order** - more specific paths before less specific, static before dynamic

## How It Works

Each Vue component in the `src/pages/` directory can export metadata that will be automatically collected and used for:

- Route generation
- Menu item creation
- Page titles
- Icons
- Menu ordering

## Adding a New Page

To add a new page, simply create a `.vue` file in the `src/pages/` directory:

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
| `src/pages/index.vue`                   | `/`                        | Home page                |
| `src/pages/api.vue`                     | `/api`                     | API page                 |
| `src/pages/user-profile.vue`            | `/user-profile`            | User profile page        |
| `src/pages/admin/index.vue`             | `/admin`                   | Admin index page         |
| `src/pages/admin/users.vue`             | `/admin/users`             | Admin users page         |
| `src/pages/admin/settings.vue`          | `/admin/settings`          | Admin settings page      |
| `src/pages/admin/reports/analytics.vue` | `/admin/reports/analytics` | Nested subdirectory page |

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
src/pages/
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

1. **Root Path**: `src/pages/index.vue` → `/`
2. **Simple Path**: `src/pages/api.vue` → `/api`
3. **Subdirectory**: `src/pages/admin/users.vue` → `/admin/users`
4. **Deep Nesting**: `src/pages/admin/reports/analytics.vue` → `/admin/reports/analytics`
5. **Index Files**: `src/pages/admin/index.vue` → `/admin`

## Benefits

1. **Decentralized Configuration**: Each page manages its own metadata
2. **Type Safety**: Full TypeScript support with interfaces
3. **Automatic Generation**: No manual route configuration needed
4. **Flexible**: Easy to add new properties to metadata
5. **Maintainable**: Changes to one page don't affect others
6. **Subdirectory Support**: Organize pages in logical directory structures

## Debugging

Visit `/debug-routes` to see all generated routes and metadata (this page is hidden from the menu by default).

## Advanced Menu Methods

The system provides several utility methods for working with `RouteRecordRaw[]` arrays to generate different types of menu information:

### Basic Menu Items

```typescript
import { getMenuItemsFromRoutes } from "../utils/auto-routes";

const routes = generateRoutes();
const menuItems = getMenuItemsFromRoutes(routes);
```

This is equivalent to `generateMenuItems()` but works with any `RouteRecordRaw[]` array.

### Filtered Menu Items

```typescript
import { getFilteredMenuItems } from "../utils/auto-routes";

const adminMenuItems = getFilteredMenuItems(routes, {
  pathPrefix: "/admin", // Only routes starting with /admin
  maxDepth: 2, // Maximum 2 path segments
  includeHidden: false, // Exclude hidden routes
});
```

### Grouped Menu Items

```typescript
import { getGroupedMenuItems } from "../utils/auto-routes";

const groupedMenuItems = getGroupedMenuItems(routes);
// Returns: { "admin": [...], "user": [...], "main": [...] }
```

### Breadcrumb Navigation

```typescript
import { getBreadcrumbsForRoute } from "../utils/auto-routes";

const breadcrumbs = getBreadcrumbsForRoute(routes, "/admin/users");
// Returns: [
//   { name: "Home", path: "/", icon: "home" },
//   { name: "Admin", path: "/admin", icon: "admin_panel_settings" },
//   { name: "Users", path: "/admin/users", icon: "people" }
// ]
```

### Usage in Vue Components

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  getMenuItemsFromRoutes,
  getBreadcrumbsForRoute,
} from "../utils/auto-routes";

const route = useRoute();
const routes = generateRoutes();

// Reactive menu items
const menuItems = computed(() => getMenuItemsFromRoutes(routes));

// Reactive breadcrumbs
const breadcrumbs = computed(() => getBreadcrumbsForRoute(routes, route.path));
</script>
```

### Menu Composable

For reusable menu logic, use the provided composable:

```typescript
import { menuComposable } from "../utils/menu-examples";

const { getMenuItems, getAdminMenu, getBreadcrumbs } = menuComposable();

const adminMenu = getAdminMenu(routes);
const breadcrumbs = getBreadcrumbs(routes, currentPath);
```

## Benefits

1. **Flexible** - Work with any `RouteRecordRaw[]` array
2. **Reactive** - Can be used with Vue's `computed()` for reactive updates
3. **Filterable** - Multiple filtering options for different use cases
4. **Groupable** - Automatic grouping by path segments
5. **Breadcrumb-ready** - Built-in breadcrumb generation
6. **Type-safe** - Full TypeScript support

## Global Router Utilities

The system provides global router utilities that can be used anywhere in the application without needing to import Vue Router directly.

### Setup

The global router is automatically set up in `main.ts`:

```typescript
import { setGlobalRouter } from "./utils/global-router";

// Set the global router instance
setGlobalRouter(router);
```

### Direct Usage (Non-Vue Context)

```typescript
import {
  getCurrentPath,
  getCurrentRouteTitle,
  getAllRoutes,
  navigateTo,
  getRouteByPath,
  checkRouteExists,
} from "../utils/global-router";

// Get current route information
const currentPath = getCurrentPath();
const currentTitle = getCurrentRouteTitle();

// Get all routes
const allRoutes = getAllRoutes();

// Navigate programmatically
navigateTo("/admin");

// Check if route exists
const exists = checkRouteExists("/admin");

// Find route by path
const route = getRouteByPath("/admin");
```

### Vue Composable Usage

For reactive access in Vue components:

```vue
<script setup lang="ts">
import { useGlobalRouter } from "../composables/useGlobalRouter";

const {
  currentPath,
  currentRouteTitle,
  currentRouteIcon,
  allRoutes,
  menuRoutes,
  adminRoutes,
  goTo,
  goBack,
  goForward,
  findRouteByPath,
  checkRouteExists,
} = useGlobalRouter();
</script>

<template>
  <div>
    <p>Current path: {{ currentPath }}</p>
    <p>Current title: {{ currentRouteTitle }}</p>
    <p>Total routes: {{ allRoutes.length }}</p>

    <q-btn @click="goTo('/admin')">Go to Admin</q-btn>
    <q-btn @click="goBack()">Back</q-btn>
  </div>
</template>
```

### Available Functions

#### Current Route Information

- `getCurrentPath()` - Get current route path
- `getCurrentRouteName()` - Get current route name
- `getCurrentRouteTitle()` - Get current route title
- `getCurrentRouteIcon()` - Get current route icon
- `getCurrentRouteMeta()` - Get current route metadata

#### Navigation

- `navigateTo(path)` - Navigate to a route
- `navigateBack()` - Go back in history
- `navigateForward()` - Go forward in history

#### Route Queries

- `getAllRoutes()` - Get all routes (cached)
- `getRouteByPath(path)` - Find route by path
- `getRouteByName(name)` - Find route by name
- `checkRouteExists(path)` - Check if route exists
- `getAllRoutePaths()` - Get all route paths
- `getAllRouteNames()` - Get all route names

#### Route Filtering

- `getRoutesByPrefix(prefix)` - Get routes by path prefix
- `getRoutesByDepth(depth)` - Get routes by path depth
- `getMenuRoutes()` - Get routes that should be shown in menu
- `getRoutesByMetaProperty(property, value)` - Get routes by meta property

#### Cache Management

- `clearRouteCache()` - Clear route cache
- `refreshRoutes()` - Refresh and regenerate routes

### Benefits

1. **Global Access** - Use anywhere without importing Vue Router
2. **Performance** - Cached route information
3. **Type Safety** - Full TypeScript support
4. **Reactive** - Vue composable for reactive updates
5. **Flexible** - Multiple filtering and query options
6. **Consistent** - Same API across the application

### Example Use Cases

```typescript
// In a utility function
export function logCurrentRoute() {
  console.log(`Current route: ${getCurrentPath()}`);
  console.log(`Title: ${getCurrentRouteTitle()}`);
}

// In a service
export function validateRoute(path: string) {
  if (!checkRouteExists(path)) {
    throw new Error(`Route ${path} does not exist`);
  }
}

// In a component
const { currentPath, goTo } = useGlobalRouter();
watch(currentPath, (newPath) => {
  console.log(`Route changed to: ${newPath}`);
});
```

## Console Access

The global router object is available in the browser console for debugging and testing:

```javascript
// Access current route information
$router.currentRoute;
$router.getCurrentPath();
$router.getCurrentRouteTitle();

// Access all routes
$router.allRoutes;
$router.menuRoutes;

// Navigate programmatically
$router.navigateTo("/admin");

// Refresh routes
$router.refreshRoutes();

// Alternative access
window.__CraftGUI_Router;
```

### Example Console Usage

```javascript
// Check current route
console.log($router.getCurrentPath());

// List all routes
$router.allRoutes.forEach((route) => {
  console.log(`${route.path} - ${route.meta?.title}`);
});

// Navigate to admin
$router.navigateTo("/admin");

// Check if route exists
$router.allRoutes.find((r) => r.path === "/admin");
```

## Application Configuration

The system automatically reads application metadata from `package.json` to provide consistent branding across the application.

### Automatic App Name Detection

The application name is automatically read from `package.json`:

```json
{
  "name": "CraftGUI",
  "version": "0.0.0"
}
```

### Available Functions

```typescript
import {
  getAppName,
  getAppVersion,
  getAppDescription,
  setPageTitle,
  getPageTitle,
} from "../utils/app-config";

// Get application metadata
const appName = getAppName(); // "CraftGUI"
const version = getAppVersion(); // "0.0.0"
const description = getAppDescription(); // ""

// Set page title dynamically
setPageTitle("Dashboard"); // Sets: "Dashboard - CraftGUI"
setPageTitle(); // Sets: "CraftGUI"

// Get formatted page title
const title = getPageTitle("Admin"); // "Admin - CraftGUI"
```

### Integration with Router

The global router utilities automatically use the app name from `package.json`:

- **Default route title**: Uses app name when no title is specified
- **Page title**: Automatically updates browser title with route title + app name
- **Welcome messages**: Uses app name in welcome descriptions

### Benefits

1. **Consistent Branding** - Single source of truth for app name
2. **Easy Updates** - Change app name in one place (`package.json`)
3. **Dynamic Titles** - Page titles automatically include app name
4. **Version Info** - Easy access to app version for debugging
5. **Type Safety** - Full TypeScript support for all functions

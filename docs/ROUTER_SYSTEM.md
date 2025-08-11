# Router System Documentation

## Overview

This project implements an innovative router system that combines automatic route generation with filename-based metadata and a clean composables architecture. The system provides a powerful, type-safe, and developer-friendly approach to Vue.js routing.

## Key Features

### 🚀 Innovative Filename-Based Metadata

- **Prefix Convention**: Use numeric prefixes in filenames to define route metadata
- **Example**: `001.example.vue` → `showInMenu: true, order: 1`
- **No Component Pollution**: Metadata is extracted from filenames, not component files
- **Compile-Time Validation**: Errors are thrown if metadata is defined in components

### 🏗️ Clean Architecture

- **Four Clear Business Domains**: Route Management, Current Route State, Navigation, Global State
- **Single Responsibility Principle**: Each composable has one clear purpose
- **Type Safety**: Full TypeScript support with proper interfaces
- **Developer Experience**: Excellent debugging capabilities with global console object

### 🔧 Advanced Features

- **Automatic Route Generation**: Routes are discovered from the file system
- **Menu Management**: Automatic menu generation based on metadata
- **Route Statistics**: Comprehensive route analytics and statistics
- **Deep Cloning**: Console-friendly object representation
- **Reactive Updates**: Real-time route state management

## Architecture

### Business Domain Separation

The router system is organized into four clear business domains:

#### 1. Route Management (`useRouteManager`)

- **Business Domain**: Route data management and querying
- **Responsibility**: Manages all route data, provides query capabilities, and maintains route statistics
- **Usage**: Initialize once at app startup, then use for route queries

#### 2. Current Route State (`useCurrentRoute`)

- **Business Domain**: Current route state and metadata
- **Responsibility**: Manages current route state, provides reactive route information
- **Usage**: Use in Vue components to access current route data

#### 3. Navigation (`useNavigation`)

- **Business Domain**: Route navigation operations
- **Responsibility**: Provides navigation methods (push, back, forward, replace)
- **Usage**: Use in Vue components for navigation operations

#### 4. Global State (`useGlobalState`)

- **Business Domain**: Global state management and console debugging
- **Responsibility**: Manages global console object and current route state updates
- **Usage**: Initialize once in the main app component for debugging capabilities

## Filename-Based Metadata System

### Naming Convention

Routes use a numeric prefix convention to define metadata:

```
[order].[name].vue
```

- **Order**: Numeric prefix (001, 002, etc.) defines the `order` property
- **Name**: The base filename becomes the route name
- **Extension**: Must be `.vue`

### Metadata Rules

| Filename Pattern   | showInMenu | order | Description            |
| ------------------ | ---------- | ----- | ---------------------- |
| `001.example.vue`  | `true`     | `1`   | Menu item with order 1 |
| `005.config.vue`   | `true`     | `5`   | Menu item with order 5 |
| `about.vue`        | `false`    | `0`   | Non-menu route         |
| `nested/route.vue` | `false`    | `0`   | Nested non-menu route  |

### Validation Rules

1. **No Component Metadata**: `showInMenu` and `order` cannot be defined in component files
2. **Compile-Time Errors**: Violations throw errors during build
3. **Default Values**: Files without prefixes default to `showInMenu: false, order: 0`
4. **Root Route**: `index.vue` (with or without prefix) becomes the root route `/`

### Examples

```vue
<!-- Example: 001.example.vue -->
<template>
  <q-page class="q-pa-md">
    <h1>Example Page</h1>
  </q-page>
</template>

<script setup lang="ts">
// Component logic here
</script>

<script lang="ts">
// Only title, icon, and description allowed
export const meta = {
  title: "Example Page",
  icon: "example",
  description: "Example page description",
};
</script>
```

## Installation and Setup

### 1. Project Structure

```
src/
├── pages/                    # Route components (auto-discovered)
├── composables/             # Router composables
│   ├── useRouteManager.ts   # Route data management
│   ├── useCurrentRoute.ts   # Current route state
│   ├── useNavigation.ts     # Navigation operations
│   └── useGlobalState.ts    # Global state management
├── utils/
│   ├── auto-routes.ts       # Route generation logic
│   └── deep-clone.ts        # Utility functions
└── types/
    └── route-meta.ts        # Type definitions
```

### 2. Application Initialization

```typescript
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/auto-routes";

const app = createApp(App);
app.use(router);
app.mount("#app");
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { initializeRouteManager } from "./composables/useRouteManager";
import { useCurrentRoute } from "./composables/useCurrentRoute";
import { useNavigation } from "./composables/useNavigation";
import { useGlobalState } from "./composables/useGlobalState";

// Initialize route manager once
const { menuRoutes } = initializeRouteManager();

// Get current route state
const { currentRoute } = useCurrentRoute();

// Get navigation methods
const { goTo } = useNavigation();

// Initialize global state management
useGlobalState();
</script>
```

## Usage Examples

### Basic Component Usage

```vue
<script setup lang="ts">
import { useRouteManager } from "../composables/useRouteManager";
import { useCurrentRoute } from "../composables/useCurrentRoute";
import { useNavigation } from "../composables/useNavigation";

// Route data management
const { menuRoutes, findRouteByPath } = useRouteManager();

// Current route state
const { currentRoute } = useCurrentRoute();

// Navigation operations
const { navigateTo } = useNavigation();

// Use in component logic
function handleRouteClick(path: string) {
  const route = findRouteByPath(path);
  if (route) {
    navigateTo(path);
  }
}
</script>

<template>
  <div>
    <h1>{{ currentRoute.title }}</h1>
    <div v-for="route in menuRoutes" :key="route.path">
      <button @click="handleRouteClick(route.path)">
        {{ route.meta?.title }}
      </button>
    </div>
  </div>
</template>
```

### Route Queries

```typescript
import { useRouteManager } from "./composables/useRouteManager";

const routeManager = useRouteManager();

// Find specific route
const specificRoute = routeManager.findRouteByPath("/example");
const nestedRoutes = routeManager.getRoutesByPrefix("/nested");

// Check route existence
const exists = routeManager.checkRouteExists("/example");

// Filter by metadata
const menuRoutes = routeManager.getRoutesByMetaProperty("showInMenu", true);
const depth1Routes = routeManager.getRoutesByDepth(1);
```

### Navigation Operations

```typescript
import { useNavigation } from "./composables/useNavigation";

const { navigateTo, goBack, goForward, replace } = useNavigation();

// Navigate to route
navigateTo("/target-route");

// Navigation history
goBack();
goForward();

// Replace current route
replace("/new-route");
```

## Global Console API

The system provides a global `$router` object in the browser console for debugging and development.

### Route Data Access

```javascript
// All available routes
$router.allRoutes;

// Menu routes (routes with showInMenu: true)
$router.menuRoutes;

// Routes by depth
$router.depth1Routes; // Routes with 1 segment
$router.depth2Routes; // Routes with 2 segments

// Route statistics
$router.stats;
// {
//   total: 15,    // Total number of routes
//   menu: 8,      // Number of menu routes
//   depth1: 5,    // Number of depth 1 routes
//   depth2: 10    // Number of depth 2 routes
// }

// Current route information
$router.currentRoute;
```

### Query Methods

```javascript
// Find route by path
$router.findRouteByPath("/target-path");

// Find route by name
$router.findRouteByName("route-name");

// Check if route exists
$router.checkRouteExists("/check-path");

// Filter routes by prefix
$router.getRoutesByPrefix("/prefix");

// Filter routes by depth
$router.getRoutesByDepth(2);

// Filter routes by meta property
$router.getRoutesByMetaProperty("showInMenu", true);
```

### Management Methods

```javascript
// Refresh route data
$router.refresh();

// Clear route cache
$router.clearCache();
```

### Debug Methods

```javascript
// Log all routes
$router.logAllRoutes();

// Log menu routes only
$router.logMenuRoutes();

// Log route statistics
$router.logRouteStats();

// Log current route
$router.logCurrentRoute();

// Log route information
$router.logRouteInfo();
```

## Type Definitions

### Route Metadata

```typescript
interface RouteMeta {
  title: string;
  icon: string;
  description?: string;
  // showInMenu and order are derived from filename
}
```

### Extended Route

```typescript
interface ExtendedRoute extends RouteLocationNormalizedLoaded {
  title: string; // Computed title
}
```

## Advanced Features

### Route Sorting

Routes are automatically sorted based on:

1. **Order Priority**: Routes with lower `order` values appear first
2. **Title Alphabetical**: When `order` values are equal, routes are sorted by `title`
3. **Path Specificity**: More specific paths before less specific paths

### Error Handling

The system provides comprehensive error handling:

- **Compile-time Validation**: Errors for invalid metadata in components
- **Runtime Validation**: Graceful handling of missing routes
- **Type Safety**: TypeScript errors for incorrect usage

### Performance Optimization

- **Reactive Updates**: Only necessary components re-render
- **Efficient Queries**: Optimized route filtering and searching
- **Memory Management**: Proper cleanup and cache management
- **Deep Cloning**: Console-friendly object representation

## Best Practices

### 1. File Organization

- Use descriptive filenames that reflect the route purpose
- Group related routes in subdirectories
- Use consistent naming conventions

### 2. Metadata Management

- Keep component metadata minimal (title, icon, description only)
- Use filename prefixes for menu ordering
- Document complex routing logic

### 3. Component Design

- Keep route components focused and single-purpose
- Use composables for shared logic
- Implement proper error boundaries

### 4. Performance

- Lazy load heavy components
- Use route guards for authentication
- Implement proper caching strategies

## Migration Guide

### From Traditional Vue Router

1. **File Structure**: Move components to `src/pages/`
2. **Metadata**: Remove `showInMenu` and `order` from components
3. **Filenames**: Add numeric prefixes for menu items
4. **Composables**: Replace direct router usage with composables

### From Other Routing Systems

1. **Installation**: Follow the setup guide above
2. **Configuration**: Update build configuration
3. **Components**: Adapt existing components to new structure
4. **Testing**: Update tests to use new composables

## Troubleshooting

### Common Issues

1. **Route Not Found**: Check filename and path structure
2. **Menu Not Showing**: Verify `showInMenu` is `true` (has numeric prefix)
3. **Order Issues**: Check numeric prefix values
4. **Type Errors**: Ensure proper TypeScript configuration

### Debug Tools

- Use `$router.logAllRoutes()` to inspect all routes
- Use `$router.logCurrentRoute()` to check current route
- Use browser dev tools to inspect the global `$router` object

## Contributing

When contributing to the router system:

1. **Follow Architecture**: Maintain the four-domain separation
2. **Add Tests**: Include comprehensive test coverage
3. **Update Documentation**: Keep this documentation current
4. **Type Safety**: Ensure all changes are type-safe
5. **Performance**: Consider performance implications

## Conclusion

This router system provides a modern, type-safe, and developer-friendly approach to Vue.js routing. With its innovative filename-based metadata system, clean architecture, and comprehensive debugging capabilities, it offers an excellent foundation for building scalable Vue.js applications.

The system balances simplicity with power, providing both easy-to-use APIs for common tasks and advanced features for complex routing scenarios. Whether you're building a simple application or a complex enterprise system, this router system can adapt to your needs while maintaining clean, maintainable code.

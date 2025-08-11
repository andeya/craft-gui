import type { RouteRecordRaw } from "vue-router";
import type { RouteMeta, PageComponent } from "../types/route-meta";
import { getAppName } from "./app-config";

// Auto-import all Vue files in pages directory
const modules = import.meta.glob("../pages/**/*.vue", {
  eager: true,
}) as Record<string, PageComponent>;

// Route configuration interface
export interface RouteConfig {
  path: string;
  name: string;
  component: any;
  meta: RouteMeta;
}

// Menu item interface
export interface MenuItem extends RouteMeta {
  path: string;
}

// Generate route configuration
export function generateRoutes(): RouteRecordRaw[] {
  const routes = Object.keys(modules).map((path) => {
    // Generate route path from file path
    let routePath = path
      .replace("../pages/", "") // Remove prefix
      .replace(/\.vue$/, "") // Remove .vue extension
      .replace(/\/index$/, ""); // Convert /index to root path

    // Handle root path - special case for index.vue
    if (routePath === "" || routePath === "index") {
      routePath = "/";
    } else {
      // Ensure path starts with /
      routePath = "/" + routePath;
    }

    // Generate route name
    const routeName =
      path
        .replace("../pages/", "")
        .replace(/\.vue$/, "")
        .replace(/\/index$/, "")
        .replace(/\//g, "-")
        .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
        .replace(/^-+/, "")
        .replace(/-+$/, "") || "Home";

    // Get component and metadata
    const component = modules[path];
    const metadata = (component.meta as RouteMeta) || ({} as RouteMeta);

    // Use metadata from component or fallback to defaults
    const title = metadata.title || routeName;
    const icon = metadata.icon || "article";
    const showInMenu = metadata.showInMenu !== false; // Default to true
    const description = metadata.description || "";
    const order = metadata.order || 999;

    return {
      path: routePath,
      name: routeName,
      component: component.default || component,
      meta: {
        title,
        icon,
        showInMenu,
        description,
        order,
      },
    };
  });

  // Add a catch-all route for the root path if no root route exists
  const hasRootRoute = routes.some((route) => route.path === "/");
  if (!hasRootRoute) {
    // Try to find index.vue in the modules
    const indexModule = modules["../pages/index.vue"];
    if (indexModule) {
      console.log("Found index.vue, using it as root route");
      routes.unshift({
        path: "/",
        name: "Home",
        component: indexModule.default || indexModule,
        meta: {
          title: "Home",
          icon: "home",
          showInMenu: true,
          description: `Welcome to ${getAppName()}`,
          order: 1,
        },
      });
    } else {
      console.warn(
        "No root route found and no index.vue available, adding fallback route"
      );
      routes.unshift({
        path: "/",
        name: "Home",
        component: () => import("../pages/index.vue"),
        meta: {
          title: "Home",
          icon: "home",
          showInMenu: true,
          description: `Welcome to ${getAppName()}`,
          order: 1,
        },
      });
    }
  }

  // Enhanced route sorting with proper priority order
  // This ensures Vue Router matches routes in the correct order:
  // 1. Root route (/) - highest priority
  // 2. More specific paths - before less specific paths (by segment count)
  // 3. Static routes - before dynamic routes (within same specificity)
  // 4. Alphabetical order - for consistent ordering
  routes.sort((a, b) => {
    const pathA = a.path;
    const pathB = b.path;

    // 1. Root route (/) should always be first
    if (pathA === "/") return -1;
    if (pathB === "/") return 1;

    // 2. More specific paths should come before less specific paths
    const segmentsA = pathA.split("/").filter(Boolean);
    const segmentsB = pathB.split("/").filter(Boolean);

    // If one path has more segments, it's more specific
    if (segmentsA.length !== segmentsB.length) {
      return segmentsB.length - segmentsA.length; // More segments first
    }

    // 3. For paths with same number of segments, static routes come before dynamic routes
    const isDynamicA = pathA.includes(":");
    const isDynamicB = pathB.includes(":");

    if (!isDynamicA && isDynamicB) return -1;
    if (isDynamicA && !isDynamicB) return 1;

    // 4. For paths with same specificity and type, sort alphabetically
    return pathA.localeCompare(pathB);
  });

  return routes;
}

// Generate menu items
export function generateMenuItems(): MenuItem[] {
  return generateMenuRoutes(generateRoutes()).map(
    (route) =>
      ({
        path: route.path,
        ...route.meta,
      } as MenuItem)
  );
}

export function generateMenuRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes
    .filter((route) => route.meta?.showInMenu === true) // Filter out routes not shown in menu
    .sort((a, b) => (a.meta?.order as number) - (b.meta?.order as number)); // Sort by order
}

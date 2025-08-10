import type { RouteRecordRaw } from "vue-router";
import type { RouteMeta, PageComponent } from "../types/route-meta";

// Auto-import all Vue files in views directory
const modules = import.meta.glob("../views/**/*.vue", {
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
export interface MenuItem {
  name: string;
  path: string;
  icon: string;
  order?: number;
}

// Generate route configuration
export function generateRoutes(): RouteRecordRaw[] {
  const routes = Object.keys(modules).map((path) => {
    // Generate route path from file path
    let routePath = path
      .replace("../views/", "") // Remove prefix
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
    const routeName = path
      .replace("../views/", "")
      .replace(/\.vue$/, "")
      .replace(/\/index$/, "")
      .replace(/\//g, "-")
      .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
      .replace(/^-+/, "")
      .replace(/-+$/, "");

    // Get component and metadata
    const component = modules[path];
    const metadata = (component.meta as RouteMeta) || {};

    // Use metadata from component or fallback to defaults
    const title = metadata.title || "Untitled";
    const icon = metadata.icon || "article";
    const showInMenu = metadata.showInMenu !== false; // Default to true
    const description = metadata.description || "";
    const order = metadata.order || 999;

    return {
      path: routePath,
      name: routeName || "Home",
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
    const indexModule = modules["../views/index.vue"];
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
          description: "Welcome to Ksool",
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
        component: () => import("../views/index.vue"),
        meta: {
          title: "Home",
          icon: "home",
          showInMenu: true,
          description: "Welcome to Ksool",
          order: 1,
        },
      });
    }
  }

  // Ensure routes are sorted with root route first
  routes.sort((a, b) => {
    if (a.path === "/") return -1;
    if (b.path === "/") return 1;
    return 0;
  });

  return routes;
}

// 生成菜单项
export function generateMenuItems(): MenuItem[] {
  const routes = generateRoutes();

  return routes
    .filter((route) => route.meta?.showInMenu !== false) // Filter out routes not shown in menu
    .map((route) => ({
      name: (route.meta?.title as string) || (route.name as string),
      path: route.path,
      icon: (route.meta?.icon as string) || "article",
      order: (route.meta?.order as number) || 999,
    }))
    .sort((a, b) => (a.order || 999) - (b.order || 999)); // Sort by order
}

// Get route configuration (for debugging)
export function getRouteConfig(): RouteConfig[] {
  return Object.keys(modules).map((path) => {
    const component = modules[path];
    const metadata = (component.meta as RouteMeta) || {};

    // Generate route path (same logic as generateRoutes)
    let routePath = path
      .replace("../views/", "")
      .replace(/\.vue$/, "")
      .replace(/\/index$/, "");

    // Handle root path - special case for HomePage.vue
    if (routePath === "" || routePath === "HomePage") {
      routePath = "/";
    } else {
      // Ensure path starts with /
      routePath = "/" + routePath;
    }

    return {
      path: routePath,
      name:
        path
          .split("/")
          .pop()
          ?.replace(/\.vue$/, "") || "",
      component: component.default || component,
      meta: {
        title: metadata.title || "Untitled",
        icon: metadata.icon || "article",
        showInMenu: metadata.showInMenu !== false,
        description: metadata.description || "",
        order: metadata.order || 999,
      },
    };
  });
}

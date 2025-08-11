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

// Parse filename for route metadata
function parseFilenameForMetadata(filename: string): {
  showInMenu: boolean;
  order: number;
  cleanName: string;
} {
  // Remove .vue extension
  const nameWithoutExt = filename.replace(/\.vue$/, "");

  // Check for prefix pattern like "001.abc" or "1.abc"
  const prefixMatch = nameWithoutExt.match(/^(\d+)\.(.+)$/);

  if (prefixMatch) {
    const order = parseInt(prefixMatch[1], 10);
    const cleanName = prefixMatch[2];
    return {
      showInMenu: true,
      order: order,
      cleanName: cleanName,
    };
  }

  // No prefix found - hide from menu and set order to 0
  return {
    showInMenu: false,
    order: 0,
    cleanName: nameWithoutExt,
  };
}

// Generate route configuration
export function generateRoutes(): RouteRecordRaw[] {
  const routes = Object.keys(modules).map((path) => {
    // Extract filename from path
    const filename = path.split("/").pop() || "";

    // Parse filename for metadata
    const { showInMenu, order, cleanName } = parseFilenameForMetadata(filename);

    // Generate route path from file path, but use cleanName for the final segment
    let routePath = path
      .replace("../pages/", "") // Remove prefix
      .replace(/\.vue$/, "") // Remove .vue extension
      .replace(/\/index$/, ""); // Convert /index to root path

    // If the filename had a prefix, replace the filename part with cleanName
    if (filename !== cleanName + ".vue") {
      const pathParts = routePath.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.match(/^\d+\./)) {
        pathParts[pathParts.length - 1] = cleanName;
        routePath = pathParts.join("/");
      }
    }

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

    // Check if component tries to override showInMenu or order (not allowed)
    if (metadata.showInMenu !== undefined) {
      throw new Error(
        `Component ${path} cannot override showInMenu. Use filename prefix to control menu visibility.`
      );
    }
    if (metadata.order !== undefined) {
      throw new Error(
        `Component ${path} cannot override order. Use filename prefix to control menu order.`
      );
    }

    // Use filename-based metadata only
    const title = metadata.title || routeName;
    const icon = metadata.icon || "article";
    const description = metadata.description || "";

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
    // Try to find index.vue (ignoring prefix) in the modules
    const indexModule = Object.keys(modules).find((path) => {
      const filename = path.split("/").pop() || "";
      const { cleanName } = parseFilenameForMetadata(filename);
      return cleanName === "index";
    });

    if (indexModule) {
      console.log("Found index.vue, using it as root route");
      routes.unshift({
        path: "/",
        name: "Home",
        component: modules[indexModule].default || modules[indexModule],
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
        "No root route found and no index.vue available, creating a simple fallback route"
      );
      routes.unshift({
        path: "/",
        name: "Home",
        component: {
          template: `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
              <h1>Welcome to ${getAppName()}</h1>
              <p>No index page found. Please create a file with 'index' in the name.</p>
              <p>Example: 001.index.vue, index.vue, or home.vue</p>
            </div>
          `,
        },
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

    if (pathA === pathB) {
      throw new Error(
        `Route name ${a.name} and ${b.name} have same path: ${pathA}`
      );
    }

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
    .sort((a, b) => {
      const orderA = a.meta?.order as number;
      const orderB = b.meta?.order as number;

      // First sort by order
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // If order is equal, sort by title
      const titleA = (a.meta?.title as string) || "";
      const titleB = (b.meta?.title as string) || "";
      return titleA.localeCompare(titleB);
    });
}

import _ from "lodash";
import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import type {
  RouteMeta,
  PageComponent,
  RouteGroupInfo,
  RouteInfo,
} from "@/types/route-meta";
import { getAppName } from "@/utils/app-config";

// Auto-import all Vue files in pages directory
const modules = import.meta.glob("../pages/**/*.vue", {
  eager: true,
}) as Record<string, PageComponent>;

const defaultGroupTitle = "DEFAULT";
const defaultGroupOrder = -1;

// route configuration
export const routes = ((): RouteRecordRaw[] => {
  const defaultHomeMeta = {
    title: "Home",
    icon: "home",
    showInMenu: true,
    description: `Welcome to ${getAppName()}`,
    order: 1,
    groupTitle: defaultGroupTitle,
    groupOrder: 1,
  } as RouteMeta;

  const routes = Object.keys(modules).map((path) => {
    // Parse filename for metadata
    const filePathMeta = parseFilePathMeta(path);

    // Generate route path from file path, but use cleanName for the final segment
    let routePath = filePathMeta.innerPath
      .replace(/\.vue$/, "") // Remove .vue extension
      .replace(/\/index$/, ""); // Convert /index to root path

    // If the filename had a prefix, replace the filename part with cleanName
    if (filePathMeta.filename !== filePathMeta.cleanName + ".vue") {
      const pathParts = routePath.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.match(/^\d+\./)) {
        pathParts[pathParts.length - 1] = filePathMeta.cleanName;
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
      filePathMeta.innerPath
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
    if (metadata.groupTitle !== undefined) {
      throw new Error(
        `Component ${path} cannot override groupTitle. Use filename prefix to control menu group.`
      );
    }
    if (metadata.groupOrder !== undefined) {
      throw new Error(
        `Component ${path} cannot override groupOrder. Use filename prefix to control menu group order.`
      );
    }

    const title = metadata.title || routeName;
    const icon = metadata.icon || "article";
    const description = metadata.description || "";
    const groupTitle =
      metadata.groupTitle ||
      filePathMeta.filegroup.toUpperCase() ||
      defaultGroupTitle;

    return {
      path: routePath,
      name: routeName,
      component: component.default || component,
      meta: {
        title,
        icon,
        showInMenu: filePathMeta.showInMenu,
        description,
        order: filePathMeta.order,
        groupTitle: groupTitle,
        groupOrder: filePathMeta.groupOrder,
      } as RouteMeta,
    };
  });

  // Add a catch-all route for the root path if no root route exists
  const hasRootRoute = routes.some((route) => route.path === "/");
  if (!hasRootRoute) {
    // Try to find index.vue (ignoring prefix) in the modules
    const indexModule = Object.keys(modules).find((path) => {
      const filename = path.split("/").pop() || "";
      const { cleanName } = parseFilePathMeta(filename);
      return cleanName === "index";
    });

    if (indexModule) {
      console.log("Found index.vue, using it as root route");
      routes.unshift({
        path: "/",
        name: "Home",
        component: modules[indexModule].default || modules[indexModule],
        meta: defaultHomeMeta,
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
        meta: defaultHomeMeta,
      });
    }
  }

  // Set default group order for routes in default group
  routes.forEach((route) => {
    if (route.meta?.groupTitle === defaultGroupTitle) {
      route.meta.groupOrder = defaultGroupOrder;
    }
  });

  // Enhanced route sorting with proper priority order
  // This ensures Vue Router matches routes in the correct order:
  // 1. Root route (/) - highest priority
  // 2. More specific paths - before less specific paths (by segment count)
  // 3. Static routes - before dynamic routes (within same specificity)
  // 4. Alphabetical order - for consistent ordering
  routes.sort((a, b) => {
    const pathA = a.path.toLowerCase();
    const pathB = b.path.toLowerCase();

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
    return a.path.localeCompare(b.path);
  });

  return routes;
})();

export const menuRoutes = ((): RouteRecordRaw[] => {
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
})();

export const routeGroupInfos = getRouteInfo(routes);
export const menuRouteGroupInfos = getRouteInfo(menuRoutes);

function getRouteInfo(routes: RouteRecordRaw[]): RouteGroupInfo[] {
  return Object.entries(_.groupBy(routes, (route) => route.meta?.groupTitle))
    .map(
      ([groupTitle, routes]) =>
        ({
          title: groupTitle || defaultGroupTitle,
          order: routes[0]?.meta?.groupOrder || 0,
          routes: routes.map(
            (route) =>
              ({
                path: route.path,
                title: route.meta?.title || route.name,
                icon: route.meta?.icon || "article",
                showInMenu: route.meta?.showInMenu || false,
                description: route.meta?.description || "",
                order: route.meta?.order || 0,
                groupTitle: route.meta?.groupTitle || defaultGroupTitle,
                groupOrder: route.meta?.groupOrder || 0,
              } as RouteInfo)
          ),
        } as RouteGroupInfo)
    )
    .sort((a, b) => {
      if (a.title === b.title) {
        return a.order - b.order;
      }
      if (a.title === defaultGroupTitle) return -1;
      if (b.title === defaultGroupTitle) return 1;
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.title.localeCompare(b.title);
    });
}

interface FilePathMeta {
  innerPath: string;
  filegroup: string;
  filename: string;
  groupOrder: number;
  showInMenu: boolean;
  order: number;
  cleanName: string;
}

// Parse filename for route metadata
function parseFilePathMeta(filepath: string): FilePathMeta {
  const prefix = "../pages/";
  const innerPath = filepath.startsWith(prefix)
    ? filepath.slice(prefix.length)
    : filepath;
  const parts = innerPath.split("/");

  // Extract filepath from path
  const filegroup = parts.length > 1 ? parts[0] : "";
  const filegroupPrefixMatch = filegroup.match(/^(\d+)\.(.+)$/);

  let filegroupName = filegroup;
  let filegroupOrder = 0;
  if (filegroupPrefixMatch) {
    filegroupOrder = parseInt(filegroupPrefixMatch[1], 10);
    filegroupName = filegroupPrefixMatch[2];
  }

  // Extract filename from path
  const filename = parts.pop() || "";

  // Remove .vue extension
  const nameWithoutExt = filename.replace(/\.vue$/, "");

  // Check for prefix pattern like "001.abc" or "1.abc"
  const namePrefixMatch = nameWithoutExt.match(/^(\d+)\.(.+)$/);

  let order = 0;
  let cleanName = nameWithoutExt;
  let showInMenu = false;
  if (namePrefixMatch) {
    order = parseInt(namePrefixMatch[1], 10);
    cleanName = namePrefixMatch[2];
    showInMenu = true;
  }

  return {
    innerPath: innerPath,
    filegroup: filegroupName,
    groupOrder: filegroupOrder,
    filename: filename,
    showInMenu: showInMenu,
    order: order,
    cleanName: cleanName,
  } as FilePathMeta;
}

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

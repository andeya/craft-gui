import { computed, ref } from "vue";
import type { RouteRecordRaw } from "vue-router";
import type { RouteMeta } from "../types/route-meta";
import { generateRoutes, generateMenuRoutes } from "../utils/auto-routes";
import { deepClone } from "../utils/deep-clone";

// Global route manager instance
let routeManager: ReturnType<typeof createRouteManager> | null = null;

/**
 * Route Manager - Manages all route data and provides query capabilities
 * Business domain: Route data management and querying
 */
function createRouteManager() {
  // Route data cache
  const allRoutes = ref<RouteRecordRaw[]>([]);
  const menuRoutes = ref<RouteRecordRaw[]>([]);

  /**
   * Initialize route data
   */
  function initializeRouteData() {
    try {
      allRoutes.value = generateRoutes();
      menuRoutes.value = generateMenuRoutes(allRoutes.value);
      updateGlobalConsoleObject();
    } catch (error) {
      console.debug("Route data initialization failed:", error);
    }
  }

  /**
   * Update global console object for debugging
   */
  function updateGlobalConsoleObject() {
    if (typeof window !== "undefined") {
      (window as any).$router = {
        // ===== Route Data =====
        allRoutes: allRoutes.value.map((route) => deepClone(route)),
        menuRoutes: menuRoutes.value.map((route) => deepClone(route)),
        depth1Routes: getRoutesByDepth(1).map((route) => deepClone(route)),
        depth2Routes: getRoutesByDepth(2).map((route) => deepClone(route)),

        // ===== Route Statistics =====
        stats: {
          total: allRoutes.value.length,
          menu: menuRoutes.value.length,
          depth1: getRoutesByDepth(1).length,
          depth2: getRoutesByDepth(2).length,
        },

        // ===== Route Queries =====
        findRouteByPath: (path: string) => {
          const route = findRouteByPath(path);
          return route ? deepClone(route) : null;
        },
        findRouteByName: (name: string) => {
          const route = findRouteByName(name);
          return route ? deepClone(route) : null;
        },
        checkRouteExists: (path: string) => checkRouteExists(path),

        // ===== Route Filters =====
        getRoutesByPrefix: (prefix: string) =>
          getRoutesByPrefix(prefix).map((route) => deepClone(route)),
        getRoutesByDepth: (depth: number) =>
          getRoutesByDepth(depth).map((route) => deepClone(route)),
        getRoutesByMetaProperty: (property: string, value: any) =>
          getRoutesByMetaProperty(property as any, value).map((route) =>
            deepClone(route)
          ),

        // ===== Management =====
        refresh: () => refresh(),
        clearCache: () => clearCache(),

        // ===== Debug =====
        logAllRoutes: () => {
          console.log(
            "All Routes:",
            allRoutes.value.map((route) => deepClone(route))
          );
        },
        logMenuRoutes: () => {
          console.log(
            "Menu Routes:",
            menuRoutes.value.map((route) => deepClone(route))
          );
        },
        logRouteStats: () => {
          console.log("Route Statistics:", {
            total: allRoutes.value.length,
            menu: menuRoutes.value.length,
            depth1: getRoutesByDepth(1).length,
            depth2: getRoutesByDepth(2).length,
          });
        },
        logRouteTree: () => {
          console.log("Route Tree:", {
            all: allRoutes.value.map((route) => deepClone(route)),
            menu: menuRoutes.value.map((route) => deepClone(route)),
          });
        },
      };
    }
  }

  // ===== Route Query Functions =====
  function findRouteByPath(path: string): RouteRecordRaw | undefined {
    return allRoutes.value.find((route) => route.path === path);
  }

  function findRouteByName(name: string): RouteRecordRaw | undefined {
    return allRoutes.value.find((route) => route.name === name);
  }

  function checkRouteExists(path: string): boolean {
    return findRouteByPath(path) !== undefined;
  }

  function getRoutesByPrefix(prefix: string): RouteRecordRaw[] {
    return allRoutes.value.filter((route) => route.path.startsWith(prefix));
  }

  function getRoutesByDepth(depth: number): RouteRecordRaw[] {
    return allRoutes.value.filter((route) => {
      const segments = route.path.split("/").filter(Boolean);
      return segments.length === depth;
    });
  }

  function getRoutesByMetaProperty<K extends keyof RouteMeta>(
    property: K,
    value: RouteMeta[K]
  ): RouteRecordRaw[] {
    return allRoutes.value.filter((route) => {
      const meta = route.meta as RouteMeta | undefined;
      return meta && meta[property] === value;
    });
  }

  // ===== Management Functions =====
  function clearCache() {
    allRoutes.value = [];
    menuRoutes.value = [];
  }

  function refresh() {
    initializeRouteData();
  }

  // Computed properties for reactive access
  const depth1Routes = computed(() => getRoutesByDepth(1));
  const depth2Routes = computed(() => getRoutesByDepth(2));

  return {
    // Data
    allRoutes,
    menuRoutes,
    depth1Routes,
    depth2Routes,

    // Query methods
    findRouteByPath,
    findRouteByName,
    checkRouteExists,
    getRoutesByPrefix,
    getRoutesByDepth,
    getRoutesByMetaProperty,

    // Management methods
    clearCache,
    refresh,
    initializeRouteData,
    updateGlobalConsoleObject,
  };
}

/**
 * Initialize route manager (call once at app startup)
 */
export function initializeRouteManager() {
  if (!routeManager) {
    routeManager = createRouteManager();
    routeManager.initializeRouteData();
    console.log("🌐 Route Manager initialized");
  }
  return routeManager;
}

/**
 * Get route manager instance
 */
function getRouteManager() {
  if (!routeManager) {
    throw new Error(
      "Route Manager not initialized. Call initializeRouteManager() first."
    );
  }
  return routeManager;
}

/**
 * Route Manager Composable
 * Provides access to route data and query capabilities
 */
export function useRouteManager() {
  return getRouteManager();
}

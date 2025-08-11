import { type RouteRecordRaw } from "vue-router";
import type { RouteMeta } from "../types/route-meta";
import { generateRoutes, generateMenuRoutes } from "./auto-routes";
import { getAppName } from "./app-config";

// Global router instance (will be set when app initializes)
let globalRouter: any = null;

// Cache for generated routes
let cachedRoutes: RouteRecordRaw[] | null = null;

// Global object for browser console access
declare global {
  interface Window {
    $router: {
      currentRoute: any;
      allRoutes: RouteRecordRaw[];
      menuRoutes: RouteRecordRaw[];
      getCurrentPath: () => string;
      getCurrentRouteTitle: () => string;
      navigateTo: (path: string) => void;
      getAllRoutes: () => RouteRecordRaw[];
      getMenuRoutes: () => RouteRecordRaw[];
      refreshRoutes: () => RouteRecordRaw[];
    };
  }
}

/**
 * Update global router object for console access
 */
export function updateGlobalRouterObject() {
  if (typeof window !== "undefined") {
    (window as any).$router = {
      currentRoute: getCurrentRoute(),
      allRoutes: getAllRoutes(),
      menuRoutes: getMenuRoutes(),
      getCurrentPath,
      getCurrentRouteTitle,
      navigateTo,
      getAllRoutes,
      getMenuRoutes,
      refreshRoutes,
    };
  }
}

/**
 * Set the global router instance
 * This should be called in main.ts after router creation
 */
export function setGlobalRouter(router: any) {
  globalRouter = router;
  // Initialize global object for console access
  updateGlobalRouterObject();
}

/**
 * Get the global router instance
 */
export function getGlobalRouter() {
  return globalRouter;
}

/**
 * Get all routes (cached for performance)
 */
export function getAllRoutes(): RouteRecordRaw[] {
  if (!cachedRoutes) {
    cachedRoutes = generateRoutes();
  }
  return cachedRoutes;
}

/**
 * Get current route information
 */
export function getCurrentRoute() {
  if (!globalRouter) {
    return null;
  }
  return globalRouter.currentRoute.value as RouteRecordRaw;
}

/**
 * Get current route path
 */
export function getCurrentPath(): string {
  const currentRoute = getCurrentRoute();
  return currentRoute?.path || "/";
}

/**
 * Get current route name
 */
export function getCurrentRouteName(): string | undefined {
  const currentRoute = getCurrentRoute();
  return currentRoute?.name as string | undefined;
}

/**
 * Get current route meta information
 */
export function getCurrentRouteMeta(): RouteMeta | undefined {
  const currentRoute = getCurrentRoute();
  return currentRoute?.meta as RouteMeta | undefined;
}

/**
 * Get current route title
 */
export function getCurrentRouteTitle(): string {
  const meta = getCurrentRouteMeta();
  return meta?.title || getAppName();
}

/**
 * Get current route icon
 */
export function getCurrentRouteIcon(): string {
  const meta = getCurrentRouteMeta();
  return meta?.icon || "article";
}

/**
 * Navigate to a route
 */
export function navigateTo(path: string) {
  if (!globalRouter) {
    console.warn("Global router not set. Call setGlobalRouter() first.");
    return;
  }
  globalRouter.push(path);
}

/**
 * Navigate back
 */
export function navigateBack() {
  if (!globalRouter) {
    console.warn("Global router not set. Call setGlobalRouter() first.");
    return;
  }
  globalRouter.back();
}

/**
 * Navigate forward
 */
export function navigateForward() {
  if (!globalRouter) {
    console.warn("Global router not set. Call setGlobalRouter() first.");
    return;
  }
  globalRouter.forward();
}

/**
 * Get route by path
 */
export function getRouteByPath(path: string): RouteRecordRaw | undefined {
  const routes = getAllRoutes();
  return routes.find((route) => route.path === path);
}

/**
 * Get route by name
 */
export function getRouteByName(name: string): RouteRecordRaw | undefined {
  const routes = getAllRoutes();
  return routes.find((route) => route.name === name);
}

/**
 * Check if a route exists
 */
export function routeExists(path: string): boolean {
  return getRouteByPath(path) !== undefined;
}

/**
 * Get all route paths
 */
export function getAllRoutePaths(): string[] {
  const routes = getAllRoutes();
  return routes.map((route) => route.path);
}

/**
 * Get all route names
 */
export function getAllRouteNames(): string[] {
  const routes = getAllRoutes();
  return routes.map((route) => route.name as string).filter(Boolean);
}

/**
 * Get routes by path prefix
 */
export function getRoutesByPrefix(prefix: string): RouteRecordRaw[] {
  const routes = getAllRoutes();
  return routes.filter((route) => route.path.startsWith(prefix));
}

/**
 * Get routes by depth
 */
export function getRoutesByDepth(depth: number): RouteRecordRaw[] {
  const routes = getAllRoutes();
  return routes.filter((route) => {
    const segments = route.path.split("/").filter(Boolean);
    return segments.length === depth;
  });
}

/**
 * Get routes that should be shown in menu
 */
export function getMenuRoutes(): RouteRecordRaw[] {
  return generateMenuRoutes(getAllRoutes());
}

/**
 * Get routes with specific meta property
 */
export function getRoutesByMetaProperty<K extends keyof RouteMeta>(
  property: K,
  value: RouteMeta[K]
): RouteRecordRaw[] {
  const routes = getAllRoutes();
  return routes.filter((route) => {
    const meta = route.meta as RouteMeta | undefined;
    return meta?.[property] === value;
  });
}

/**
 * Clear route cache (useful for development)
 */
export function clearRouteCache() {
  cachedRoutes = null;
}

/**
 * Refresh routes (regenerate and clear cache)
 */
export function refreshRoutes(): RouteRecordRaw[] {
  clearRouteCache();
  return getAllRoutes();
}

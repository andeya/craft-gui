import type { RouteRecordRaw } from "vue-router";
import type { RouteMeta } from "../types/route-meta";
import { routes, menuRoutes, routeGroupInfos } from "../router/auto-routes";
import { deepClone } from "../utils/deep-clone";

// ===== Route Query Functions =====
export function findRouteByPath(path: string): RouteRecordRaw | undefined {
  return routes.find((route) => route.path === path);
}

export function findRouteByName(name: string): RouteRecordRaw | undefined {
  return routes.find((route) => route.name === name);
}

export function checkRouteExists(path: string): boolean {
  return findRouteByPath(path) !== undefined;
}

export function getRoutesByPrefix(prefix: string): RouteRecordRaw[] {
  return routes.filter((route) => route.path.startsWith(prefix));
}

export function getRoutesByDepth(depth: number): RouteRecordRaw[] {
  return routes.filter((route) => {
    const segments = route.path.split("/").filter(Boolean);
    return segments.length === depth;
  });
}

export function getRoutesByMetaProperty<K extends keyof RouteMeta>(
  property: K,
  value: RouteMeta[K]
): RouteRecordRaw[] {
  return routes.filter((route) => {
    const meta = route.meta as RouteMeta | undefined;
    return meta && meta[property] === value;
  });
}

export function registerWindowRouterObject() {
  if (typeof window !== "undefined") {
    (window as any).$router = {
      // ===== Route Data =====
      routeGroupInfos: deepClone(routeGroupInfos),
      routes: deepClone(routes),
      depth1Routes: deepClone(getRoutesByDepth(1)),
      depth2Routes: deepClone(getRoutesByDepth(2)),

      // ===== Route Statistics =====
      stats: {
        total: routes.length,
        menu: menuRoutes.length,
        group: routeGroupInfos.length,
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
        deepClone(getRoutesByPrefix(prefix)),
      getRoutesByDepth: (depth: number) => deepClone(getRoutesByDepth(depth)),
      getRoutesByMetaProperty: (property: string, value: any) =>
        deepClone(getRoutesByMetaProperty(property as any, value)),
    };
  }
}

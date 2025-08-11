import { computed, ref, watch, nextTick } from "vue";
import type { RouteRecordRaw } from "vue-router";
import type { RouteMeta } from "../types/route-meta";
import {
  getAllRoutes,
  getCurrentRoute,
  getCurrentPath,
  getCurrentRouteName,
  getCurrentRouteMeta,
  getCurrentRouteTitle,
  getCurrentRouteIcon,
  navigateTo,
  navigateBack,
  navigateForward,
  getRouteByPath,
  getRouteByName,
  routeExists,
  getAllRoutePaths,
  getAllRouteNames,
  getRoutesByPrefix,
  getRoutesByDepth,
  getMenuRoutes,
  getRoutesByMetaProperty,
  clearRouteCache,
  refreshRoutes,
  getGlobalRouter,
  updateGlobalRouterObject,
} from "../utils/global-router";
import { getAppName } from "../utils/app-config";

/**
 * Vue composable for global router utilities
 * Provides reactive access to router information
 */
export function useGlobalRouter() {
  // Reactive current route information with safe defaults
  const currentRoute = ref<any>(null);
  const currentPath = ref("/");
  const currentRouteName = ref<string | undefined>(undefined);
  const currentRouteMeta = ref<RouteMeta | undefined>(undefined);
  const currentRouteTitle = ref(getAppName());
  const currentRouteIcon = ref("article");

  // Reactive routes information
  const allRoutes = ref<RouteRecordRaw[]>([]);
  const allRoutePaths = ref<string[]>([]);
  const allRouteNames = ref<string[]>([]);
  const menuRoutes = ref<RouteRecordRaw[]>([]);

  // Initialize routes data
  const initializeRoutes = () => {
    try {
      allRoutes.value = getAllRoutes();
      allRoutePaths.value = getAllRoutePaths();
      allRouteNames.value = getAllRouteNames();
      menuRoutes.value = getMenuRoutes();

      // Update global object for console access
      updateGlobalRouterObject();
    } catch (error) {
      console.debug("Routes not ready yet:", error);
    }
  };

  // Update reactive values when route changes
  const updateRouteInfo = () => {
    try {
      currentRoute.value = getCurrentRoute();
      currentPath.value = getCurrentPath();
      currentRouteName.value = getCurrentRouteName();
      currentRouteMeta.value = getCurrentRouteMeta();
      currentRouteTitle.value = getCurrentRouteTitle();
      currentRouteIcon.value = getCurrentRouteIcon();

      // Update global object for console access
      updateGlobalRouterObject();
    } catch (error) {
      // Silently handle errors when router is not set
      console.debug("Router not ready yet:", error);
    }
  };

  // Setup route watcher with retry mechanism
  const setupRouteWatcher = () => {
    const globalRouter = getGlobalRouter();
    if (globalRouter) {
      watch(
        () => globalRouter.currentRoute.value,
        () => {
          updateRouteInfo();
        },
        { immediate: true }
      );
      return true;
    }
    return false;
  };

  // Initialize everything
  const initialize = () => {
    initializeRoutes();
    if (!setupRouteWatcher()) {
      // Retry after a short delay if router is not ready
      setTimeout(initialize, 100);
    }
  };

  // Start initialization
  nextTick(() => {
    initialize();
  });

  // Computed properties for filtered routes
  const adminRoutes = computed(() => getRoutesByPrefix("/admin"));
  const userRoutes = computed(() => getRoutesByPrefix("/user"));
  const depth1Routes = computed(() => getRoutesByDepth(1));
  const depth2Routes = computed(() => getRoutesByDepth(2));

  // Navigation functions with error handling
  const goTo = async (path: string) => {
    try {
      navigateTo(path);
      await nextTick();
      updateRouteInfo();
    } catch (error) {
      console.warn("Navigation failed:", error);
    }
  };

  const goBack = async () => {
    try {
      navigateBack();
      await nextTick();
      updateRouteInfo();
    } catch (error) {
      console.warn("Navigation back failed:", error);
    }
  };

  const goForward = async () => {
    try {
      navigateForward();
      await nextTick();
      updateRouteInfo();
    } catch (error) {
      console.warn("Navigation forward failed:", error);
    }
  };

  // Route query functions
  const findRouteByPath = (path: string) => getRouteByPath(path);
  const findRouteByName = (name: string) => getRouteByName(name);
  const checkRouteExists = (path: string) => routeExists(path);

  // Filter functions
  const getRoutesByPrefixReactive = (prefix: string) =>
    getRoutesByPrefix(prefix);
  const getRoutesByDepthReactive = (depth: number) => getRoutesByDepth(depth);
  const getRoutesByMetaPropertyReactive = <K extends keyof RouteMeta>(
    property: K,
    value: RouteMeta[K]
  ) => getRoutesByMetaProperty(property, value);

  // Cache management
  const clearCache = () => {
    clearRouteCache();
    initializeRoutes();
  };

  const refresh = () => {
    const newRoutes = refreshRoutes();
    allRoutes.value = newRoutes;
    allRoutePaths.value = getAllRoutePaths();
    allRouteNames.value = getAllRouteNames();
    menuRoutes.value = getMenuRoutes();
    return newRoutes;
  };

  return {
    // Current route information (reactive)
    currentRoute: computed(() => currentRoute.value),
    currentPath: computed(() => currentPath.value),
    currentRouteName: computed(() => currentRouteName.value),
    currentRouteMeta: computed(() => currentRouteMeta.value),
    currentRouteTitle: computed(() => currentRouteTitle.value),
    currentRouteIcon: computed(() => currentRouteIcon.value),

    // All routes information (reactive)
    allRoutes: computed(() => allRoutes.value),
    allRoutePaths: computed(() => allRoutePaths.value),
    allRouteNames: computed(() => allRouteNames.value),
    menuRoutes: computed(() => menuRoutes.value),

    // Filtered routes (computed)
    adminRoutes,
    userRoutes,
    depth1Routes,
    depth2Routes,

    // Navigation functions
    goTo,
    goBack,
    goForward,

    // Route query functions
    findRouteByPath,
    findRouteByName,
    checkRouteExists,

    // Filter functions
    getRoutesByPrefix: getRoutesByPrefixReactive,
    getRoutesByDepth: getRoutesByDepthReactive,
    getRoutesByMetaProperty: getRoutesByMetaPropertyReactive,

    // Cache management
    clearCache,
    refresh,

    // Manual update function
    updateRouteInfo,
  };
}

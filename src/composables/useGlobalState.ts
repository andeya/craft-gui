import { watch } from "vue";
import { useRoute } from "vue-router";
import { deepClone } from "../utils/deep-clone";
import { useRouteManager } from "./useRouteManager";

/**
 * Global State Manager
 * Business domain: Global state management and console debugging
 * Must be used inside Vue component setup() function
 */
export function useGlobalState() {
  const route = useRoute();
  const routeManager = useRouteManager();

  /**
   * Update global console object with current route info
   */
  function updateGlobalConsoleObject() {
    if (typeof window !== "undefined") {
      const existingRouter = (window as any).$router || {};

      (window as any).$router = {
        ...existingRouter,

        // ===== Current Route Information =====
        currentRoute: deepClone(route),

        // ===== Debug =====
        logCurrentRoute: () => {
          console.log("Current Route:", deepClone(route));
        },
        logRouteInfo: () => {
          console.log("Route Information:", {
            current: deepClone(route),
            stats: {
              total: routeManager.allRoutes.value.length,
              menu: routeManager.menuRoutes.value.length,
            },
          });
        },
      };
    }
  }

  // Update global router object when route changes
  watch(
    () => route.path,
    () => {
      updateGlobalConsoleObject();
    },
    { immediate: true }
  );

  return {
    updateGlobalConsoleObject,
  };
}

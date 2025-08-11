import { computed } from "vue";
import { useRoute } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { getAppName } from "../utils/app-config";

// Extended route type with computed properties
interface ExtendedRoute extends RouteLocationNormalizedLoaded {
  title: string;
}

/**
 * Current Route State Manager
 * Business domain: Current route state and metadata
 * Must be used inside Vue component setup() function
 */
export function useCurrentRoute() {
  const route = useRoute();

  // Current route with computed properties
  const currentRoute = computed<ExtendedRoute>(() => ({
    ...route,
    title: (route.meta?.title as string) || getAppName(),
  }));

  return {
    // Current route state
    currentRoute,
  };
}

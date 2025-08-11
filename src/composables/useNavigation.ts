import { useRouter } from "vue-router";

/**
 * Navigation Manager
 * Business domain: Route navigation operations
 * Must be used inside Vue component setup() function
 */
export function useNavigation() {
  const router = useRouter();

  return {
    // Navigation methods
    navigateTo: (path: string) => router.push(path),
    navigateBack: () => router.back(),
    navigateForward: () => router.forward(),
    replaceRoute: (path: string) => router.replace(path),
    
    // Alias methods for convenience
    goTo: (path: string) => router.push(path),
    goBack: () => router.back(),
    goForward: () => router.forward(),
    replace: (path: string) => router.replace(path),
  };
}

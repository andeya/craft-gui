/**
 * Deep clone object using JSON serialization
 * This creates a plain JavaScript object from any complex object
 * Perfect for console debugging and avoiding Proxy objects
 */
export function deepClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn("Deep clone failed, returning original object:", error);
    return obj;
  }
}

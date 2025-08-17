/**
 * Cleanup utilities for managing timers and event listeners
 */

export interface CleanupItem {
  id: string;
  cleanup: () => void;
  type: "timeout" | "interval" | "listener" | "custom";
}

export class CleanupManager {
  private items: Map<string, CleanupItem> = new Map();

  /**
   * Add a timeout that will be automatically cleaned up
   */
  addTimeout(id: string, callback: () => void, delay: number): string {
    const timeoutId = setTimeout(callback, delay);
    const cleanup = () => clearTimeout(timeoutId);

    this.items.set(id, {
      id,
      cleanup,
      type: "timeout",
    });

    return id;
  }

  /**
   * Add an interval that will be automatically cleaned up
   */
  addInterval(id: string, callback: () => void, delay: number): string {
    const intervalId = setInterval(callback, delay);
    const cleanup = () => clearInterval(intervalId);

    this.items.set(id, {
      id,
      cleanup,
      type: "interval",
    });

    return id;
  }

  /**
   * Add an event listener that will be automatically cleaned up
   */
  addEventListener(
    id: string,
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): string {
    target.addEventListener(type, listener, options);
    const cleanup = () => target.removeEventListener(type, listener, options);

    this.items.set(id, {
      id,
      cleanup,
      type: "listener",
    });

    return id;
  }

  /**
   * Add a custom cleanup function
   */
  addCustom(id: string, cleanup: () => void): string {
    this.items.set(id, {
      id,
      cleanup,
      type: "custom",
    });

    return id;
  }

  /**
   * Remove a specific cleanup item
   */
  remove(id: string): boolean {
    const item = this.items.get(id);
    if (item) {
      item.cleanup();
      this.items.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Clean up all items
   */
  cleanup(): void {
    for (const item of this.items.values()) {
      item.cleanup();
    }
    this.items.clear();
  }

  /**
   * Clean up items by type
   */
  cleanupByType(type: CleanupItem["type"]): void {
    for (const [id, item] of this.items.entries()) {
      if (item.type === type) {
        item.cleanup();
        this.items.delete(id);
      }
    }
  }

  /**
   * Get all cleanup items
   */
  getItems(): CleanupItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Check if an item exists
   */
  has(id: string): boolean {
    return this.items.has(id);
  }

  /**
   * Get the number of cleanup items
   */
  get size(): number {
    return this.items.size;
  }
}

// Global cleanup manager instance
export const globalCleanup = new CleanupManager();

// Vue composable for component-level cleanup
export function useCleanup() {
  const cleanup = new CleanupManager();

  // Automatically cleanup when component is unmounted
  // Note: This requires Vue 3 composition API
  // import { onUnmounted } from 'vue';
  // onUnmounted(() => {
  //   cleanup.cleanup();
  // });

  return cleanup;
}

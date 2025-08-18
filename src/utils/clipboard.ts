/**
 * Cross-platform clipboard utility
 * Using Tauri v2 clipboard-manager plugin with fallback for browsers
 */

import {
  writeText,
  readText,
  writeImage,
  readImage,
  writeHtml,
} from "@tauri-apps/plugin-clipboard-manager";
import { Image as TauriImage } from "@tauri-apps/api/image";

// Global Tauri API (when withGlobalTauri is enabled)
declare global {
  interface Window {
    __TAURI__?: {
      clipboardManager?: {
        writeText: (text: string) => Promise<void>;
        readText: () => Promise<string>;
      };
    };
  }
}

// Platform detection
const isTauri = typeof window !== "undefined" && "__TAURI__" in window;
const isWebView = isTauri;
const isMobile =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);

/**
 * Copy text to clipboard using Tauri v2 clipboard-manager plugin
 * @param text - Text to copy to clipboard
 * @returns Promise<boolean> - Success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Method 1: Global Tauri API (when withGlobalTauri is enabled)
    if (isTauri && window.__TAURI__?.clipboardManager?.writeText) {
      await window.__TAURI__.clipboardManager.writeText(text);
      return true;
    }

    // Method 2: Tauri v2 clipboard-manager plugin (primary method)
    if (isTauri) {
      await writeText(text);
      return true;
    }

    // Method 3: Modern browser Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Method 4: Fallback for older browsers and edge cases
    return await fallbackCopyToClipboard(text);
  } catch (error) {
    console.error("Clipboard copy failed:", error);
    return false;
  }
}

/**
 * Read text from clipboard using Tauri v2 clipboard-manager plugin
 * @returns Promise<string | null> - Clipboard text content, null if not supported or empty
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    // Method 1: Global Tauri API (when withGlobalTauri is enabled)
    if (isTauri && window.__TAURI__?.clipboardManager?.readText) {
      return await window.__TAURI__.clipboardManager.readText();
    }

    // Method 2: Tauri v2 clipboard-manager plugin (primary method)
    if (isTauri) {
      return await readText();
    }

    // Method 3: Modern browser Clipboard API
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }

    return null; // Not supported in this environment
  } catch (error) {
    console.error("Clipboard read failed:", error);
    return null;
  }
}

/**
 * Fallback clipboard copy method using document.execCommand
 * @param text - Text to copy
 * @returns Promise<boolean> - Success status
 */
async function fallbackCopyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Make it invisible
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      textArea.style.opacity = "0";
      textArea.style.pointerEvents = "none";
      textArea.style.zIndex = "-1";

      document.body.appendChild(textArea);

      // Select and copy
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");

      // Clean up
      document.body.removeChild(textArea);

      resolve(successful);
    } catch (error) {
      console.error("Fallback clipboard copy failed:", error);
      resolve(false);
    }
  });
}

/**
 * Check if clipboard API is supported
 * @returns boolean - Whether clipboard operations are supported
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}

/**
 * Check if clipboard read is supported
 * @returns boolean - Whether clipboard read is supported
 */
export function isClipboardReadSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.readText);
}

/**
 * Platform information for debugging
 */
export const clipboardPlatformInfo = {
  isTauri,
  isWebView,
  isMobile,
  isIOS,
  isAndroid,
  userAgent: navigator.userAgent,
  clipboardSupported: isClipboardSupported(),
  clipboardReadSupported: isClipboardReadSupported(),
  tauriVersion: isTauri ? "v2" : "none",
  webviewType: isTauri ? "Tauri WebView" : "Browser",
  globalTauriAvailable: !!window.__TAURI__?.clipboardManager,
};

/**
 * Copy HTML content to clipboard
 * @param html - HTML content to copy
 * @param altText - Optional plain text fallback
 * @returns Promise<boolean> - Success status
 */
export async function copyHtmlToClipboard(
  html: string,
  altText?: string
): Promise<boolean> {
  try {
    // Method 1: Tauri v2 clipboard-manager plugin (primary method)
    if (isTauri) {
      await writeHtml(html, altText);
      return true;
    }

    // Method 2: Modern browser Clipboard API
    if (navigator.clipboard && navigator.clipboard.write) {
      const clipboardItems = [
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([altText || html], { type: "text/plain" }),
        }),
      ];
      await navigator.clipboard.write(clipboardItems);
      return true;
    }

    // Method 3: Fallback to text copy
    return await copyToClipboard(altText || html);
  } catch (error) {
    console.error("Clipboard HTML copy failed:", error);
    return false;
  }
}

/**
 * Copy DOM element as HTML to clipboard
 * @param element - DOM element to copy
 * @param includeStyles - Whether to include computed styles
 * @returns Promise<boolean> - Success status
 */
export async function copyElementAsHtml(
  element: HTMLElement,
  includeStyles: boolean = false
): Promise<boolean> {
  try {
    let html = element.outerHTML;

    if (includeStyles) {
      // Get computed styles for the element
      const styles = window.getComputedStyle(element);
      const styleString = Array.from(styles)
        .map((prop) => `${prop}: ${styles.getPropertyValue(prop)}`)
        .join("; ");

      // Insert styles into the element
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const firstElement = tempDiv.firstElementChild as HTMLElement;
      if (firstElement) {
        firstElement.style.cssText = styleString;
        html = tempDiv.innerHTML;
      }
    }

    // Extract text content for fallback
    const textContent = element.textContent || element.innerText || "";

    return await copyHtmlToClipboard(html, textContent);
  } catch (error) {
    console.error("Copy element as HTML failed:", error);
    return false;
  }
}

/**
 * Copy rich text (HTML with formatting) to clipboard
 * @param text - Text content
 * @param options - Formatting options
 * @returns Promise<boolean> - Success status
 */
export async function copyRichText(
  text: string,
  options: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    fontSize?: string;
    fontFamily?: string;
  } = {}
): Promise<boolean> {
  try {
    const { bold, italic, underline, color, fontSize, fontFamily } = options;

    let html = text;

    // Apply formatting
    if (bold) html = `<strong>${html}</strong>`;
    if (italic) html = `<em>${html}</em>`;
    if (underline) html = `<u>${html}</u>`;

    // Apply styles
    const styles: string[] = [];
    if (color) styles.push(`color: ${color}`);
    if (fontSize) styles.push(`font-size: ${fontSize}`);
    if (fontFamily) styles.push(`font-family: ${fontFamily}`);

    if (styles.length > 0) {
      html = `<span style="${styles.join("; ")}">${html}</span>`;
    }

    return await copyHtmlToClipboard(html, text);
  } catch (error) {
    console.error("Copy rich text failed:", error);
    return false;
  }
}

/**
 * Read HTML content from clipboard
 * @returns Promise<string | null> - HTML content, null if not supported or no HTML content
 */
export async function readHtmlFromClipboard(): Promise<string | null> {
  try {
    // Method 1: Modern browser Clipboard API (primary method)
    if (navigator.clipboard && navigator.clipboard.read) {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes("text/html")) {
          const htmlBlob = await item.getType("text/html");
          return await htmlBlob.text();
        }
      }
    }

    // Method 2: Fallback to text read (HTML not available)
    return await readFromClipboard();
  } catch (error) {
    console.error("Clipboard HTML read failed:", error);
    return null;
  }
}

/**
 * Copy multiple items to clipboard (if supported)
 * @param items - Array of clipboard items
 * @returns Promise<boolean> - Success status
 */
export async function copyMultipleToClipboard(
  items: Array<{ type: string; data: string }>
): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      const clipboardItems = items.map(
        (item) =>
          new ClipboardItem({
            [item.type]: new Blob([item.data], { type: item.type }),
          })
      );
      await navigator.clipboard.write(clipboardItems);
      return true;
    }

    // Fallback: copy the first text item
    const textItem = items.find((item) => item.type === "text/plain");
    if (textItem) {
      return await copyToClipboard(textItem.data);
    }

    return false;
  } catch (error) {
    console.error("Multiple clipboard copy failed:", error);
    return false;
  }
}

/**
 * Image clipboard helpers (Tauri v2)
 */

/**
 * Copy raw RGBA bytes to clipboard as image
 * data must be RGBA byte array of length width * height * 4
 */
export async function copyRgbaToClipboard(
  data: Uint8Array,
  width: number,
  height: number
): Promise<boolean> {
  try {
    if (!data || width <= 0 || height <= 0) return false;
    const img = await TauriImage.new(data, width, height);
    await writeImage(img);
    return true;
  } catch (error) {
    console.error("Clipboard image (RGBA) copy failed:", error);
    return false;
  }
}

/**
 * Copy HTMLCanvasElement content to clipboard as image
 */
export async function copyCanvasToClipboard(
  canvas: HTMLCanvasElement
): Promise<boolean> {
  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const { width, height } = canvas;
    const img = ctx.getImageData(0, 0, width, height);
    // Copy into a Uint8Array (expected by TauriImage.new)
    const data = new Uint8Array(img.data);
    return await copyRgbaToClipboard(data, width, height);
  } catch (error) {
    console.error("Clipboard image (canvas) copy failed:", error);
    return false;
  }
}

/**
 * Copy an <img> element to clipboard as image (draws to canvas first)
 */
export async function copyImageElementToClipboard(
  imgEl: HTMLImageElement
): Promise<boolean> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = imgEl.naturalWidth || imgEl.width;
    canvas.height = imgEl.naturalHeight || imgEl.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.drawImage(imgEl, 0, 0);
    return await copyCanvasToClipboard(canvas);
  } catch (error) {
    console.error("Clipboard image (<img>) copy failed:", error);
    return false;
  }
}

/**
 * Copy a Blob image (e.g., from fetch or file input) to clipboard
 */
export async function copyBlobImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    const imgBitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = imgBitmap.width;
    canvas.height = imgBitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.drawImage(imgBitmap, 0, 0);
    return await copyCanvasToClipboard(canvas);
  } catch (error) {
    console.error("Clipboard image (blob) copy failed:", error);
    return false;
  }
}

/**
 * Read image from clipboard as DOM ImageData
 * Returns null if there is no image in clipboard or platform doesn't support it
 */
export async function readImageFromClipboardAsImageData(): Promise<ImageData | null> {
  try {
    const img = await readImage();
    if (!img) return null;
    const [rgba, size] = await Promise.all([img.rgba(), img.size()]);
    const clamped = new Uint8ClampedArray(rgba.buffer.slice(0));
    return new ImageData(clamped, size.width, size.height);
  } catch (error) {
    console.error("Clipboard read image failed:", error);
    return null;
  }
}

/**
 * Read image from clipboard and return a PNG data URL
 */
export async function readImageFromClipboardAsDataUrl(): Promise<
  string | null
> {
  const imageData = await readImageFromClipboardAsImageData();
  if (!imageData) return null;
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

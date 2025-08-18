/**
 * Clipboard usage examples
 * Demonstrates how to use the Tauri v2 clipboard-manager plugin
 */

import {
  copyToClipboard,
  readFromClipboard,
  copyHtmlToClipboard,
  copyElementAsHtml,
  copyRichText,
  readHtmlFromClipboard,
  copyCanvasToClipboard,
  copyImageElementToClipboard,
  copyBlobImageToClipboard,
  readImageFromClipboardAsImageData,
  readImageFromClipboardAsDataUrl,
} from "./clipboard";

/**
 * Example 1: Basic clipboard operations
 */
export async function basicClipboardExample() {
  console.log("=== Basic Clipboard Operations ===");

  // Copy text to clipboard
  const copyResult = await copyToClipboard("Hello from Tauri v2!");
  console.log("Copy result:", copyResult);

  // Read text from clipboard
  try {
    const text = await readFromClipboard();
    console.log("Read text:", text);
  } catch (error) {
    console.error("Read failed:", error);
  }
}

/**
 * Example 2: Clipboard with notifications
 */
export async function clipboardWithNotificationsExample(
  notify: (type: string, message: string) => void
) {
  console.log("=== Clipboard with Notifications ===");

  const success = await copyToClipboard("Copied with notification!");

  if (success) {
    notify("positive", "Text copied successfully!");
  } else {
    notify("negative", "Failed to copy text");
  }
}

/**
 * Example 3: HTML clipboard operations
 */
export async function htmlClipboardExample() {
  console.log("=== HTML Clipboard Operations ===");

  // Copy HTML content
  const htmlContent =
    "<h1>Hello World</h1><p>This is <strong>bold</strong> text.</p>";
  const htmlResult = await copyHtmlToClipboard(
    htmlContent,
    "Hello World - This is bold text."
  );
  console.log("HTML copy result:", htmlResult);

  // Read HTML from clipboard
  try {
    const html = await readHtmlFromClipboard();
    console.log("Read HTML:", html);
  } catch (error) {
    console.error("HTML read failed:", error);
  }
}

/**
 * Example 4: Copy DOM element as HTML
 */
export async function copyElementExample() {
  console.log("=== Copy DOM Element ===");

  // Create a test element
  const testElement = document.createElement("div");
  testElement.innerHTML = `
    <h2>Test Element</h2>
    <p style="color: blue;">This is a test paragraph with <em>emphasis</em>.</p>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  `;

  // Copy element with styles
  const elementResult = await copyElementAsHtml(testElement, true);
  console.log("Element copy result:", elementResult);
}

/**
 * Example 5: Rich text formatting
 */
export async function richTextExample() {
  console.log("=== Rich Text Formatting ===");

  // Copy rich text with formatting
  const richTextResult = await copyRichText("Hello World", {
    bold: true,
    italic: true,
    color: "#ff0000",
    fontSize: "18px",
    fontFamily: "Arial, sans-serif",
  });
  console.log("Rich text copy result:", richTextResult);
}

/**
 * Example 6: Canvas to clipboard
 */
export async function canvasClipboardExample() {
  console.log("=== Canvas to Clipboard ===");

  // Create a test canvas
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Draw something on the canvas
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0, 0, 200, 100);
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Canvas Test", 100, 60);

    // Copy canvas to clipboard
    const canvasResult = await copyCanvasToClipboard(canvas);
    console.log("Canvas copy result:", canvasResult);
  }
}

/**
 * Example 7: Image element to clipboard
 */
export async function imageElementClipboardExample() {
  console.log("=== Image Element to Clipboard ===");

  // Create a test image element
  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = async () => {
    const imageResult = await copyImageElementToClipboard(img);
    console.log("Image element copy result:", imageResult);
  };

  img.onerror = () => {
    console.log("Test image failed to load, skipping image element test");
  };

  // Use a simple data URL for testing
  img.src =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQyYz0zZiIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=";
}

/**
 * Example 8: Blob image to clipboard
 */
export async function blobImageClipboardExample() {
  console.log("=== Blob Image to Clipboard ===");

  // Create a simple SVG blob
  const svgString = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#2196F3"/>
      <text x="50" y="50" font-family="Arial" font-size="16" fill="white" text-anchor="middle">Blob</text>
    </svg>
  `;

  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const blobResult = await copyBlobImageToClipboard(blob);
  console.log("Blob image copy result:", blobResult);
}

/**
 * Example 9: Read image from clipboard
 */
export async function readImageExample() {
  console.log("=== Read Image from Clipboard ===");

  try {
    // Try to read image as ImageData
    const imageData = await readImageFromClipboardAsImageData();
    if (imageData) {
      console.log("Image data:", {
        width: imageData.width,
        height: imageData.height,
        dataLength: imageData.data.length,
      });
    } else {
      console.log("No image data in clipboard");
    }

    // Try to read image as data URL
    const dataUrl = await readImageFromClipboardAsDataUrl();
    if (dataUrl) {
      console.log("Image data URL length:", dataUrl.length);
    } else {
      console.log("No image data URL in clipboard");
    }
  } catch (error) {
    console.error("Image read failed:", error);
  }
}

/**
 * Example 10: Multiple clipboard operations
 */
export async function multipleOperationsExample() {
  console.log("=== Multiple Clipboard Operations ===");

  // Copy text
  await copyToClipboard("Sample text content");

  // Wait a bit
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Copy HTML
  await copyHtmlToClipboard("<h1>Sample HTML</h1>", "Sample HTML");

  // Wait a bit
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Read back
  const text = await readFromClipboard();
  console.log("Final clipboard content:", text);
}

/**
 * Run all examples
 */
export async function runAllExamples(
  notify?: (type: string, message: string) => void
) {
  console.log("Running all clipboard examples...\n");

  basicClipboardExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (notify) {
    clipboardWithNotificationsExample(notify);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  htmlClipboardExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  copyElementExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  richTextExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  canvasClipboardExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  imageElementClipboardExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  blobImageClipboardExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  readImageExample();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  multipleOperationsExample();

  console.log("\nAll examples completed!");
}

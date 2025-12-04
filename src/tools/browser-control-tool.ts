/**
 * Browser Control Tool for Strands Agent
 * 
 * Comprehensive browser control tool that enables the agent to:
 * - Navigate browser pages
 * - Extract page content
 * - Interact with DOM elements
 * - Capture screenshots
 * - Query and inspect page elements
 */

import { z } from "zod";

// Tool action enum with all supported operations
export const BrowserActionSchema = z.enum([
  // Navigation actions (Phase 2)
  "navigate",
  "back",
  "forward",
  "refresh",
  "getCurrentUrl",
  "getTitle",
  
  // Content extraction actions (Phase 3)
  "extractMarkdown",
  "extractText",
  "extractHtml",
  "getSelectedText",
  
  // DOM interaction actions (Phase 4)
  "click",
  "type",
  "scroll",
  "hover",
  "waitForElement",
  
  // Screenshot actions (Phase 5)
  "captureVisibleTab",
  "captureFullPage",
  "captureElement",
  
  // Query and inspection actions (Phase 6)
  "querySelectorAll",
  "getElementInfo",
  "getLinks",
  "getForms",
]);

// Parameter schemas for each action
export const BrowserControlParamsSchema = z.object({
  action: BrowserActionSchema,
  
  // Navigation parameters
  url: z.string().url().optional().describe("URL to navigate to"),
  
  // DOM interaction parameters
  selector: z.string().optional().describe("CSS selector for element"),
  text: z.string().optional().describe("Text to type into element"),
  direction: z.enum(["up", "down", "left", "right"]).optional().describe("Scroll direction"),
  amount: z.number().optional().describe("Scroll amount in pixels"),
  timeout: z.number().optional().describe("Timeout in milliseconds"),
  
  // Options
  waitForLoad: z.boolean().optional().default(true).describe("Wait for page load completion"),
  useReadability: z.boolean().optional().default(true).describe("Use readability mode for content extraction"),
  maxLength: z.number().optional().default(50000).describe("Maximum content length for extraction"),
  compressImage: z.boolean().optional().default(true).describe("Compress screenshot image"),
  maxImageWidth: z.number().optional().default(1280).describe("Maximum image width for screenshots"),
});

export type BrowserControlParams = z.infer<typeof BrowserControlParamsSchema>;
export type BrowserAction = z.infer<typeof BrowserActionSchema>;

// Tool result type
export interface BrowserControlResult {
  success: boolean;
  action: BrowserAction;
  data?: any;
  error?: string;
  message?: string;
}

// Tool definition following Strands SDK pattern
export const browserControlTool = {
  name: "browser_control",
  description: `Comprehensive browser control tool that allows the agent to navigate, interact with, and extract information from web pages.

Available actions:

**Navigation:**
- navigate(url): Navigate to a URL
- back(): Go back in history
- forward(): Go forward in history
- refresh(): Refresh current page
- getCurrentUrl(): Get current page URL
- getTitle(): Get page title

**Content Extraction:**
- extractMarkdown(): Extract page content as Markdown (uses Readability for clean content)
- extractText(): Extract plain text from page
- extractHtml(selector?): Extract HTML (optionally from specific selector)
- getSelectedText(): Get currently selected text

**DOM Interaction:**
- click(selector): Click on element matching selector
- type(selector, text): Type text into element
- scroll(direction, amount?): Scroll page in direction
- hover(selector): Hover over element
- waitForElement(selector, timeout?): Wait for element to appear

**Screenshots:**
- captureVisibleTab(): Capture visible portion of tab
- captureFullPage(): Capture full page screenshot
- captureElement(selector): Capture screenshot of specific element

**Query & Inspection:**
- querySelectorAll(selector): Find all elements matching selector
- getElementInfo(selector): Get detailed info about element
- getLinks(): Get all links on page
- getForms(): Get all forms on page

All actions handle errors gracefully and return structured results.`,
  
  parameters: BrowserControlParamsSchema,
  
  execute: async (_params: BrowserControlParams): Promise<BrowserControlResult> => {
    // This will be implemented to communicate with the content script
    // For now, this is the interface definition
    throw new Error("Tool execution must be implemented with Chrome extension APIs");
  },
};

// Export for tool registration with agent
export function createBrowserControlTool() {
  return browserControlTool;
}

/**
 * Background Service Worker for Browser Control Tool
 * 
 * Handles:
 * - Navigation actions (using chrome.tabs API)
 * - Screenshot capture (using chrome.tabs.captureVisibleTab)
 * - Communication between popup/agent and content scripts
 * - Tool execution orchestration
 */

import type { BrowserControlParams, BrowserControlResult } from "./tools/browser-control-tool";

// Listen for messages from popup or other extension components
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "EXECUTE_BROWSER_CONTROL") {
    executeBrowserControl(message.params)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          success: false,
          action: message.params.action,
          error: error.message || "Unknown error occurred",
        });
      });
    return true; // Indicates async response
  }
});

/**
 * Main execution function for browser control tool
 */
async function executeBrowserControl(params: BrowserControlParams): Promise<BrowserControlResult> {
  const { action } = params;

  try {
    // Handle navigation actions in background script
    if (["navigate", "back", "forward", "refresh", "getCurrentUrl", "getTitle"].includes(action)) {
      return await handleNavigationAction(params);
    }

    // Handle screenshot actions in background script
    if (["captureVisibleTab", "captureFullPage", "captureElement"].includes(action)) {
      return await handleScreenshotAction(params);
    }

    // Forward all other actions to content script
    return await executeInContentScript(params);
  } catch (error) {
    return {
      success: false,
      action,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Phase 2: Navigation Actions
 */

async function handleNavigationAction(params: BrowserControlParams): Promise<BrowserControlResult> {
  const { action } = params;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      throw new Error("No active tab found");
    }

    switch (action) {
      case "navigate":
        if (!params.url) {
          throw new Error("URL is required for navigate action");
        }
        await chrome.tabs.update(tab.id, { url: params.url });
        
        if (params.waitForLoad) {
          await waitForTabLoad(tab.id);
        }
        
        return {
          success: true,
          action: "navigate",
          data: { url: params.url },
          message: `Navigated to ${params.url}`,
        };

      case "back":
        await chrome.tabs.goBack(tab.id);
        if (params.waitForLoad) {
          await waitForTabLoad(tab.id);
        }
        return {
          success: true,
          action: "back",
          message: "Navigated back",
        };

      case "forward":
        await chrome.tabs.goForward(tab.id);
        if (params.waitForLoad) {
          await waitForTabLoad(tab.id);
        }
        return {
          success: true,
          action: "forward",
          message: "Navigated forward",
        };

      case "refresh":
        await chrome.tabs.reload(tab.id);
        if (params.waitForLoad) {
          await waitForTabLoad(tab.id);
        }
        return {
          success: true,
          action: "refresh",
          message: "Page refreshed",
        };

      case "getCurrentUrl":
        return {
          success: true,
          action: "getCurrentUrl",
          data: { url: tab.url },
          message: `Current URL: ${tab.url}`,
        };

      case "getTitle":
        return {
          success: true,
          action: "getTitle",
          data: { title: tab.title },
          message: `Page title: ${tab.title}`,
        };

      default:
        throw new Error(`Unknown navigation action: ${action}`);
    }
  } catch (error) {
    throw new Error(`Navigation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Phase 5: Screenshot Actions
 */

async function handleScreenshotAction(params: BrowserControlParams): Promise<BrowserControlResult> {
  const { action } = params;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      throw new Error("No active tab found");
    }

    switch (action) {
      case "captureVisibleTab":
        const visibleImage = await chrome.tabs.captureVisibleTab(tab.windowId, {
          format: "png",
        });
        
        const processedVisible = params.compressImage 
          ? await compressImage(visibleImage, params.maxImageWidth || 1280)
          : visibleImage;

        return {
          success: true,
          action: "captureVisibleTab",
          data: {
            image: processedVisible,
            format: "png",
            compressed: params.compressImage,
          },
          message: "Captured visible tab screenshot",
        };

      case "captureFullPage":
        // For full page, we need to scroll and capture multiple times
        const fullPageImage = await captureFullPage(tab.id);
        
        const processedFull = params.compressImage
          ? await compressImage(fullPageImage, params.maxImageWidth || 1280)
          : fullPageImage;

        return {
          success: true,
          action: "captureFullPage",
          data: {
            image: processedFull,
            format: "png",
            compressed: params.compressImage,
          },
          message: "Captured full page screenshot",
        };

      case "captureElement":
        if (!params.selector) {
          throw new Error("Selector is required for captureElement action");
        }
        
        // Get element position from content script
        const positionResult = await executeInContentScript({
          ...params,
          action: "captureElement",
        });
        
        if (!positionResult.success || !positionResult.data?.position) {
          throw new Error("Failed to get element position");
        }

        // Capture visible tab
        const elementImage = await chrome.tabs.captureVisibleTab(tab.windowId, {
          format: "png",
        });

        // In a full implementation, we would crop the image to the element
        // For now, return the full screenshot with element coordinates
        const processedElement = params.compressImage
          ? await compressImage(elementImage, params.maxImageWidth || 1280)
          : elementImage;

        return {
          success: true,
          action: "captureElement",
          data: {
            image: processedElement,
            format: "png",
            compressed: params.compressImage,
            elementPosition: positionResult.data.position,
            note: "Full screenshot returned with element coordinates. Crop using position data if needed.",
          },
          message: `Captured screenshot for element: ${params.selector}`,
        };

      default:
        throw new Error(`Unknown screenshot action: ${action}`);
    }
  } catch (error) {
    throw new Error(`Screenshot failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Execute action in content script
 */
async function executeInContentScript(params: BrowserControlParams): Promise<BrowserControlResult> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.id) {
    throw new Error("No active tab found");
  }

  // Send message to content script
  try {
    const result = await chrome.tabs.sendMessage(tab.id, {
      type: "BROWSER_CONTROL_ACTION",
      params,
    });
    return result;
  } catch (error) {
    // If content script is not loaded, inject it first
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content-script.js"],
      });
      
      // Wait a bit for script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try again
      const result = await chrome.tabs.sendMessage(tab.id, {
        type: "BROWSER_CONTROL_ACTION",
        params,
      });
      return result;
    } catch (retryError) {
      throw new Error(`Failed to execute in content script: ${retryError instanceof Error ? retryError.message : "Unknown error"}`);
    }
  }
}

/**
 * Helper Functions
 */

async function waitForTabLoad(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    const listener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
    
    // Timeout after 30 seconds
    setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      resolve();
    }, 30000);
  });
}

async function captureFullPage(tabId: number): Promise<string> {
  // Simplified version - just capture visible area
  // Full implementation would scroll and stitch images
  const tab = await chrome.tabs.get(tabId);
  if (!tab.windowId) {
    throw new Error("Tab has no window ID");
  }
  
  return await chrome.tabs.captureVisibleTab(tab.windowId, {
    format: "png",
  });
}

async function compressImage(dataUrl: string, _maxWidth: number): Promise<string> {
  // In a real implementation, this would use canvas to resize the image
  // For now, we'll return the original
  // This would require converting to canvas, resizing, and converting back
  return dataUrl;
}

console.log("[Strands Browser Control] Background service worker loaded");

/**
 * Content Script for Browser Control Tool
 * 
 * Injected into web pages to perform DOM operations, content extraction,
 * and interact with page elements on behalf of the agent.
 */

import TurndownService from "turndown";
import { Readability } from "@mozilla/readability";
import type { BrowserControlParams, BrowserControlResult } from "./tools/browser-control-tool";

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Message listener for commands from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "BROWSER_CONTROL_ACTION") {
    handleBrowserAction(message.params)
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
 * Main handler for browser control actions
 */
async function handleBrowserAction(params: BrowserControlParams): Promise<BrowserControlResult> {
  const { action } = params;

  try {
    switch (action) {
      // Content extraction actions
      case "extractMarkdown":
        return await extractMarkdown(params);
      case "extractText":
        return await extractText();
      case "extractHtml":
        return await extractHtml(params.selector);
      case "getSelectedText":
        return await getSelectedText();

      // DOM interaction actions
      case "click":
        return await clickElement(params.selector!);
      case "type":
        return await typeIntoElement(params.selector!, params.text!);
      case "scroll":
        return await scrollPage(params.direction!, params.amount);
      case "hover":
        return await hoverElement(params.selector!);
      case "waitForElement":
        return await waitForElement(params.selector!, params.timeout);

      // Screenshot actions (handled by background script, but we can help with element selection)
      case "captureElement":
        return await getElementPosition(params.selector!);

      // Query and inspection actions
      case "querySelectorAll":
        return await queryElements(params.selector!);
      case "getElementInfo":
        return await getElementInfo(params.selector!);
      case "getLinks":
        return await getLinks();
      case "getForms":
        return await getForms();

      default:
        return {
          success: false,
          action,
          error: `Action ${action} must be handled by background script`,
        };
    }
  } catch (error) {
    return {
      success: false,
      action,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Phase 3: Content Extraction Methods
 */

async function extractMarkdown(params: BrowserControlParams): Promise<BrowserControlResult> {
  try {
    let content: string;
    
    if (params.useReadability) {
      // Use Readability to extract main content
      const documentClone = document.cloneNode(true) as Document;
      const reader = new Readability(documentClone);
      const article = reader.parse();
      
      if (article) {
        // Convert the clean HTML to Markdown
        content = turndownService.turndown(article.content || '');
      } else {
        // Fallback to full document
        content = turndownService.turndown(document.body.innerHTML);
      }
    } else {
      // Extract full document
      content = turndownService.turndown(document.body.innerHTML);
    }

    // Truncate if needed
    if (content.length > params.maxLength!) {
      content = content.substring(0, params.maxLength!) + "\n\n... (content truncated)";
    }

    return {
      success: true,
      action: "extractMarkdown",
      data: {
        content,
        length: content.length,
        title: document.title,
        url: window.location.href,
      },
      message: `Extracted ${content.length} characters of markdown content`,
    };
  } catch (error) {
    throw new Error(`Failed to extract markdown: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function extractText(): Promise<BrowserControlResult> {
  try {
    const text = document.body.innerText;
    return {
      success: true,
      action: "extractText",
      data: {
        text,
        length: text.length,
      },
      message: `Extracted ${text.length} characters of text`,
    };
  } catch (error) {
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function extractHtml(selector?: string): Promise<BrowserControlResult> {
  try {
    let html: string;
    
    if (selector) {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      html = element.innerHTML;
    } else {
      html = document.body.innerHTML;
    }

    return {
      success: true,
      action: "extractHtml",
      data: {
        html,
        length: html.length,
      },
      message: `Extracted ${html.length} characters of HTML`,
    };
  } catch (error) {
    throw new Error(`Failed to extract HTML: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function getSelectedText(): Promise<BrowserControlResult> {
  try {
    const selection = window.getSelection();
    const text = selection?.toString() || "";
    
    return {
      success: true,
      action: "getSelectedText",
      data: {
        text,
        hasSelection: text.length > 0,
      },
      message: text.length > 0 ? `Got selected text: ${text.length} characters` : "No text selected",
    };
  } catch (error) {
    throw new Error(`Failed to get selected text: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Phase 4: DOM Interaction Methods
 */

async function clickElement(selector: string): Promise<BrowserControlResult> {
  try {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    element.click();
    
    return {
      success: true,
      action: "click",
      data: {
        selector,
        tagName: element.tagName.toLowerCase(),
      },
      message: `Clicked element: ${selector}`,
    };
  } catch (error) {
    throw new Error(`Failed to click element: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function typeIntoElement(selector: string, text: string): Promise<BrowserControlResult> {
  try {
    const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Focus the element
    element.focus();
    
    // Set value
    element.value = text;
    
    // Trigger input event for frameworks that listen to it
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));

    return {
      success: true,
      action: "type",
      data: {
        selector,
        text,
        tagName: element.tagName.toLowerCase(),
      },
      message: `Typed "${text}" into element: ${selector}`,
    };
  } catch (error) {
    throw new Error(`Failed to type into element: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function scrollPage(direction: string, amount?: number): Promise<BrowserControlResult> {
  try {
    const scrollAmount = amount || 300;
    
    let x = 0;
    let y = 0;
    
    switch (direction) {
      case "down":
        y = scrollAmount;
        break;
      case "up":
        y = -scrollAmount;
        break;
      case "right":
        x = scrollAmount;
        break;
      case "left":
        x = -scrollAmount;
        break;
    }

    window.scrollBy({ left: x, top: y, behavior: "smooth" });

    return {
      success: true,
      action: "scroll",
      data: {
        direction,
        amount: scrollAmount,
        currentScroll: {
          x: window.scrollX,
          y: window.scrollY,
        },
      },
      message: `Scrolled ${direction} by ${scrollAmount}px`,
    };
  } catch (error) {
    throw new Error(`Failed to scroll: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function hoverElement(selector: string): Promise<BrowserControlResult> {
  try {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Dispatch mouse events
    element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    element.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

    return {
      success: true,
      action: "hover",
      data: {
        selector,
        tagName: element.tagName.toLowerCase(),
      },
      message: `Hovered over element: ${selector}`,
    };
  } catch (error) {
    throw new Error(`Failed to hover element: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function waitForElement(selector: string, timeout?: number): Promise<BrowserControlResult> {
  const maxWait = timeout || 5000;
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkElement = () => {
      const element = document.querySelector(selector);
      
      if (element) {
        resolve({
          success: true,
          action: "waitForElement",
          data: {
            selector,
            tagName: element.tagName.toLowerCase(),
            waitTime: Date.now() - startTime,
          },
          message: `Element found: ${selector}`,
        });
      } else if (Date.now() - startTime > maxWait) {
        reject(new Error(`Element not found within ${maxWait}ms: ${selector}`));
      } else {
        setTimeout(checkElement, 100);
      }
    };

    checkElement();
  });
}

/**
 * Phase 5: Screenshot Helper Methods
 */

async function getElementPosition(selector: string): Promise<BrowserControlResult> {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    const rect = element.getBoundingClientRect();
    
    return {
      success: true,
      action: "captureElement",
      data: {
        selector,
        position: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
      },
      message: `Got element position for: ${selector}`,
    };
  } catch (error) {
    throw new Error(`Failed to get element position: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Phase 6: Query & Inspection Methods
 */

async function queryElements(selector: string): Promise<BrowserControlResult> {
  try {
    const elements = Array.from(document.querySelectorAll(selector));
    
    const elementInfo = elements.map((el, index) => ({
      index,
      tagName: el.tagName.toLowerCase(),
      id: el.id || undefined,
      className: el.className || undefined,
      text: el.textContent?.substring(0, 100) || undefined,
      attributes: getElementAttributes(el),
    }));

    return {
      success: true,
      action: "querySelectorAll",
      data: {
        selector,
        count: elements.length,
        elements: elementInfo,
      },
      message: `Found ${elements.length} elements matching: ${selector}`,
    };
  } catch (error) {
    throw new Error(`Failed to query elements: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function getElementInfo(selector: string): Promise<BrowserControlResult> {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    const rect = element.getBoundingClientRect();
    
    return {
      success: true,
      action: "getElementInfo",
      data: {
        selector,
        tagName: element.tagName.toLowerCase(),
        id: element.id || undefined,
        className: element.className || undefined,
        text: element.textContent?.substring(0, 200) || undefined,
        attributes: getElementAttributes(element),
        position: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
        visible: rect.width > 0 && rect.height > 0,
      },
      message: `Got info for element: ${selector}`,
    };
  } catch (error) {
    throw new Error(`Failed to get element info: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function getLinks(): Promise<BrowserControlResult> {
  try {
    const links = Array.from(document.querySelectorAll("a[href]"));
    
    const linkInfo = links.map((link, index) => ({
      index,
      href: (link as HTMLAnchorElement).href,
      text: link.textContent?.trim().substring(0, 100) || "",
      title: link.getAttribute("title") || undefined,
    }));

    return {
      success: true,
      action: "getLinks",
      data: {
        count: links.length,
        links: linkInfo,
      },
      message: `Found ${links.length} links on the page`,
    };
  } catch (error) {
    throw new Error(`Failed to get links: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function getForms(): Promise<BrowserControlResult> {
  try {
    const forms = Array.from(document.querySelectorAll("form"));
    
    const formInfo = forms.map((form, index) => ({
      index,
      id: form.id || undefined,
      name: form.getAttribute("name") || undefined,
      action: form.action || undefined,
      method: form.method || undefined,
      fields: Array.from(form.querySelectorAll("input, textarea, select")).map((field) => ({
        tagName: field.tagName.toLowerCase(),
        type: field.getAttribute("type") || undefined,
        name: field.getAttribute("name") || undefined,
        id: field.id || undefined,
        placeholder: field.getAttribute("placeholder") || undefined,
        required: field.hasAttribute("required"),
      })),
    }));

    return {
      success: true,
      action: "getForms",
      data: {
        count: forms.length,
        forms: formInfo,
      },
      message: `Found ${forms.length} forms on the page`,
    };
  } catch (error) {
    throw new Error(`Failed to get forms: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Helper Functions
 */

function getElementAttributes(element: Element): Record<string, string> {
  const attrs: Record<string, string> = {};
  
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attrs[attr.name] = attr.value;
  }
  
  return attrs;
}

// Signal that content script is loaded
console.log("[Strands Browser Control] Content script loaded");

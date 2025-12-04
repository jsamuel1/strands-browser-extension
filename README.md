# Strands Browser Control Extension

## Overview

A comprehensive browser control tool for Strands Agent that enables AI-powered browser automation through a Chrome extension. The agent can navigate, interact with, and extract information from web pages using natural language commands.

![Browser Agent Architecture](images/browser_agent.png)

| Feature | Description |
|---------|-------------|
| Extension Type | Chrome Extension (Manifest V3) |
| Agent Tools | Browser control with 24+ actions |
| Architecture | Content script + Background worker + Popup UI |
| Build Tool | Vite + TypeScript |
| Model Providers | Amazon Bedrock (Claude Sonnet 4), OpenAI (GPT-4o) |
| Testing | Vitest (Unit + Integration tests) |

## Prerequisites

- Node.js 18.x or later
- Chrome browser for extension installation
- One of the following:
  - AWS credentials with Amazon Bedrock access (Access Key ID, Secret Access Key, and optionally Session Token for temporary credentials)
  - OpenAI API key
- Basic TypeScript and Chrome extension development knowledge

## Features

### 🚀 Browser Control Capabilities

#### Navigation Controls (Phase 2)
- **navigate(url)**: Navigate to any URL with automatic page load detection
- **back()**: Go back in browser history
- **forward()**: Go forward in browser history
- **refresh()**: Reload current page
- **getCurrentUrl()**: Get current page URL
- **getTitle()**: Get current page title

#### Content Extraction (Phase 3)
- **extractMarkdown()**: Extract clean page content as Markdown using Readability
- **extractText()**: Extract plain text from page
- **extractHtml(selector?)**: Extract HTML content (optionally from specific element)
- **getSelectedText()**: Get currently selected text on page

#### DOM Interaction (Phase 4)
- **click(selector)**: Click on elements using CSS selectors
- **type(selector, text)**: Type text into form fields
- **scroll(direction, amount?)**: Scroll page in any direction
- **hover(selector)**: Hover over elements to trigger events
- **waitForElement(selector, timeout?)**: Wait for elements to appear

#### Screenshot Capture (Phase 5)
- **captureVisibleTab()**: Capture visible portion of tab
- **captureFullPage()**: Capture full page screenshot (with scrolling)
- **captureElement(selector)**: Capture screenshot of specific element

#### Query & Inspection (Phase 6)
- **querySelectorAll(selector)**: Find all matching elements with details
- **getElementInfo(selector)**: Get detailed element information
- **getLinks()**: Extract all links from page
- **getForms()**: Extract all forms and their fields

### 🛠 Technical Implementation

- **Chrome Extension APIs**: Uses chrome.tabs, chrome.scripting, chrome.debugger
- **Content Script Injection**: Automatic injection for DOM access
- **Readability Integration**: Clean content extraction using @mozilla/readability
- **Turndown Conversion**: HTML to Markdown conversion
- **Zod Schema Validation**: Type-safe parameter validation
- **Error Handling**: Graceful error handling with detailed messages

## Project Structure

```
strands-browser-extension/
├── manifest.json              # Chrome extension manifest (v3)
├── popup.html                 # Extension popup UI
├── src/
│   ├── main.ts               # Original web app (legacy)
│   ├── popup.ts              # Extension popup with agent integration
│   ├── background.ts         # Background service worker
│   ├── content-script.ts     # Content script for DOM operations
│   ├── style.css             # Chat interface styling
│   └── tools/
│       └── browser-control-tool.ts  # Tool definition with Zod schemas
├── tests/
│   ├── setup.ts              # Test setup with Chrome API mocks
│   ├── unit/                 # Unit tests
│   │   ├── browser-control-tool.test.ts
│   │   └── content-script.test.ts
│   └── integration/          # Integration tests
│       └── browser-control.test.ts
├── images/                   # Documentation images
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
├── vitest.config.ts          # Unit test configuration
└── vitest.integration.config.ts  # Integration test configuration
```

## Installation & Usage

### Development Setup

```bash
# Install dependencies
npm install

# Build the extension
npm run build:extension

# Run tests
npm run test:unit
npm run test:integration
```

### Chrome Extension Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist/` directory
4. The extension will appear in your browser toolbar

### Using the Extension

1. **Click the extension icon** in the browser toolbar
2. **Connect to your AI model**:
   - Choose Amazon Bedrock or OpenAI
   - Enter your credentials
   - Click "Connect to Agent"
3. **Start controlling your browser**:
   - Type natural language commands like:
     - "Navigate to https://example.com"
     - "Click on the login button"
     - "Extract the main content as markdown"
     - "Take a screenshot of this page"
     - "Fill out the form with my information"

### Example Commands

```
User: Navigate to https://news.ycombinator.com and extract the headlines
Agent: I'll navigate to Hacker News and extract the headlines for you.

User: Click on the first article and take a screenshot
Agent: I'll click the first article link and capture a screenshot.

User: Find all forms on this page and tell me what fields they have
Agent: I'll analyze all forms on the current page and list their fields.
```

## Tool Architecture

### Tool Definition (Phase 1)

The browser control tool follows Strands SDK patterns with Zod schema validation:

```typescript
import { z } from "zod";

const browserControlTool = {
  name: "browser_control",
  description: "Comprehensive browser control with 24+ actions...",
  parameters: BrowserControlParamsSchema,
  execute: async (params) => {
    // Execute via Chrome extension APIs
  }
};

// Register with agent
const agent = new Agent({
  model,
  systemPrompt: "You are a browser automation assistant...",
  tools: [browserControlTool],
});
```

### Tool Schema

```typescript
const BrowserControlParamsSchema = z.object({
  action: z.enum([
    "navigate", "back", "forward", "refresh",
    "extractMarkdown", "click", "type", "scroll",
    "captureVisibleTab", "getLinks", // ... and more
  ]),
  url: z.string().url().optional(),
  selector: z.string().optional(),
  text: z.string().optional(),
  direction: z.enum(["up", "down", "left", "right"]).optional(),
  // ... additional parameters
});
```

### Communication Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Popup UI  │─────▶│  Background  │─────▶│ Content Script  │
│  (Agent)    │      │   Worker     │      │  (DOM Access)   │
└─────────────┘      └──────────────┘      └─────────────────┘
       │                     │                       │
       │                     │                       │
       ▼                     ▼                       ▼
  Tool Invoke          Navigation/           DOM Operations
  via Agent            Screenshots           & Extraction
```

## API Reference

### Browser Control Actions

#### Navigation
```typescript
// Navigate to URL
{ action: "navigate", url: "https://example.com", waitForLoad: true }

// Browser history
{ action: "back" }
{ action: "forward" }
{ action: "refresh" }

// Get page info
{ action: "getCurrentUrl" }
{ action: "getTitle" }
```

#### Content Extraction
```typescript
// Extract as markdown (recommended)
{ action: "extractMarkdown", useReadability: true, maxLength: 50000 }

// Extract plain text
{ action: "extractText" }

// Extract HTML
{ action: "extractHtml", selector: "#main-content" }

// Get selected text
{ action: "getSelectedText" }
```

#### DOM Interaction
```typescript
// Click elements
{ action: "click", selector: "#submit-button" }

// Type into fields
{ action: "type", selector: "input[name='email']", text: "user@example.com" }

// Scroll page
{ action: "scroll", direction: "down", amount: 500 }

// Hover elements
{ action: "hover", selector: ".dropdown-trigger" }

// Wait for elements
{ action: "waitForElement", selector: ".loading-complete", timeout: 5000 }
```

#### Screenshots
```typescript
// Capture visible area
{ action: "captureVisibleTab", compressImage: true, maxImageWidth: 1280 }

// Capture full page
{ action: "captureFullPage" }

// Capture specific element
{ action: "captureElement", selector: "#chart", compressImage: true }
```

#### Query & Inspection
```typescript
// Find elements
{ action: "querySelectorAll", selector: "a[href]" }

// Get element details
{ action: "getElementInfo", selector: "#main-form" }

// Extract page links
{ action: "getLinks" }

// Extract page forms
{ action: "getForms" }
```

## Testing (Phase 7)

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

### Test Coverage

The project includes comprehensive test coverage:

#### Unit Tests
- **Tool Definition Tests**: Validates tool schema, parameters, and structure
- **Schema Validation Tests**: Tests all parameter combinations and validation rules
- **DOM Operation Tests**: Tests element selection, interaction, and content extraction
- **Mock Chrome APIs**: Complete Chrome extension API mocking

#### Integration Tests
- **Full Flow Tests**: Tests complete browser control workflows
- **Page Interaction Tests**: Form filling, clicking, scrolling
- **Content Extraction Tests**: Link extraction, form parsing, content retrieval
- **Element Inspection Tests**: Query operations and element information gathering

### Test Results

```
✓ tests/unit/browser-control-tool.test.ts (18 tests)
✓ tests/unit/content-script.test.ts (17 tests)
✓ tests/integration/browser-control.test.ts (14 tests)

Test Files: 3 passed (3)
Tests: 49 passed (49)
```

## Security & Permissions

### Chrome Extension Permissions

The extension requires the following permissions:

- **activeTab**: Access to current active tab
- **tabs**: Browser tab management and navigation
- **scripting**: Content script injection for DOM access
- **storage**: Local storage for settings (optional)
- **debugger**: Advanced debugging capabilities (if needed)
- **<all_urls>**: Access to all websites for comprehensive browser control

### Security Considerations

1. **Credential Handling**: 
   - Credentials are stored temporarily in memory only
   - No credentials are saved to local storage by default
   - Use secure token-based auth for production deployments

2. **Content Security Policy**:
   - Extension follows Manifest V3 security guidelines
   - No inline scripts or eval() usage
   - Secure message passing between components

3. **Data Privacy**:
   - Page content is processed locally when possible
   - Screenshots and extracted data are handled securely
   - No data is sent to external services except AI model APIs

### Production Deployment

For production use:
1. Implement secure credential management
2. Use token-based authentication instead of direct API keys
3. Consider running agent backend services instead of browser-only
4. Implement proper error logging and monitoring
5. Add user consent and privacy controls

## Development & Contributing

### Build Process

```bash
# Development build
npm run dev

# Production build for extension
npm run build:extension

# This creates dist/ directory with:
# - popup.html (extension popup)
# - popup.js (popup script)
# - background.js (service worker)
# - content-script.js (DOM access)
# - manifest.json (extension config)
```

### Adding New Actions

1. **Add action to schema** in `browser-control-tool.ts`:
```typescript
const BrowserActionSchema = z.enum([
  // ... existing actions
  "newAction",
]);
```

2. **Add parameters** (if needed):
```typescript
const BrowserControlParamsSchema = z.object({
  // ... existing params
  newParam: z.string().optional(),
});
```

3. **Implement handler** in content script or background:
```typescript
case "newAction":
  return await handleNewAction(params);
```

4. **Add tests** in appropriate test files
5. **Update documentation**

### Debugging

- **Extension Console**: Chrome DevTools → Extensions → Inspect views
- **Content Script**: Right-click page → Inspect → Console
- **Background Worker**: chrome://extensions → Extension details → Inspect views
- **Network**: Monitor API calls in DevTools Network tab

## Additional Resources

- [Strands Agents Documentation](https://strandsagents.com/latest/)
- [Vite Documentation](https://vitejs.dev/)

## Troubleshooting

### Common Issues

1. **Extension not loading**:
   - Ensure all files are in `dist/` after build
   - Check `manifest.json` is copied correctly
   - Verify Chrome extension developer mode is enabled

2. **Content script not working**:
   - Check if content script is injected: `chrome.scripting.executeScript`
   - Verify page permissions in manifest
   - Check browser console for content script errors

3. **Tool not responding**:
   - Verify agent credentials are correct
   - Check Chrome extension permissions
   - Monitor background service worker console

4. **Screenshots failing**:
   - Ensure `chrome.tabs.captureVisibleTab` permission
   - Check if tab is active and visible
   - Verify no browser security restrictions

### Debug Commands

```typescript
// Test tool directly
const result = await chrome.runtime.sendMessage({
  type: "EXECUTE_BROWSER_CONTROL",
  params: { action: "getCurrentUrl" }
});

// Check content script injection
chrome.tabs.query({active: true}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {type: "ping"});
});
```

## Performance Considerations

- **Content Extraction**: Use `maxLength` parameter to prevent memory issues
- **Screenshots**: Enable compression for large images
- **DOM Queries**: Use specific selectors for better performance
- **Scrolling**: Use appropriate amounts to prevent excessive operations

## Browser Compatibility

- **Chrome/Chromium**: Full support (primary target)
- **Edge**: Compatible with Chromium-based Edge
- **Firefox**: Requires manifest adaptation for WebExtensions
- **Safari**: Not supported (different extension architecture)

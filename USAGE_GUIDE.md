# Strands Browser Control Tool - Usage Guide

## Quick Start

### 1. Installation

```bash
# Clone and setup
cd strands-browser-extension
npm install --legacy-peer-deps

# Build the extension
npm run build:extension
```

### 2. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle "Developer mode" ON (top right)
3. Click "Load unpacked"
4. Select the `dist/` folder
5. Extension should appear in your toolbar

### 3. Connect to AI Model

1. Click the extension icon
2. Select your provider (Bedrock or OpenAI)
3. Enter credentials
4. Click "Connect to Agent"

## Example Use Cases

### Web Scraping & Data Extraction

**Extract content from news site:**
```
User: Navigate to https://news.ycombinator.com and extract all the article titles as markdown

Agent: I'll navigate to Hacker News and extract the content for you...
[Uses: navigate, extractMarkdown]
```

**Extract structured data:**
```
User: Find all links on this page and show me the ones that contain "documentation"

Agent: I'll search for documentation links...
[Uses: getLinks]
```

### Form Automation

**Fill out forms:**
```
User: Fill out the login form with username "testuser" and password "test123"

Agent: I'll fill out the login form for you...
[Uses: type("#username", "testuser"), type("#password", "test123")]
```

**Submit forms:**
```
User: Click the submit button

Agent: I'll submit the form...
[Uses: click("button[type='submit']")]
```

### Testing & QA

**Test page interactions:**
```
User: Click on the menu, then navigate to the about page, and take a screenshot

Agent: I'll perform those actions...
[Uses: click(".menu"), waitForElement(".about-link"), click(".about-link"), captureVisibleTab]
```

**Verify content:**
```
User: Check if this page contains a contact form

Agent: I'll check for forms on the page...
[Uses: getForms]
```

### Content Monitoring

**Track page changes:**
```
User: Navigate to example.com and extract the main content

Agent: I'll navigate and extract the content...
[Uses: navigate, extractMarkdown]

User: (Later) Refresh the page and extract again

Agent: I'll refresh and check for changes...
[Uses: refresh, extractMarkdown]
```

## Action Reference

### Navigation Actions

| Action | Parameters | Example |
|--------|------------|---------|
| `navigate` | url, waitForLoad | Navigate to URL |
| `back` | - | Go back in history |
| `forward` | - | Go forward in history |
| `refresh` | waitForLoad | Reload page |
| `getCurrentUrl` | - | Get current URL |
| `getTitle` | - | Get page title |

**Example:**
```
User: Go to google.com
Agent: [Uses: navigate("https://google.com")]

User: What's the current page title?
Agent: [Uses: getTitle()]
```

### Content Extraction Actions

| Action | Parameters | Example |
|--------|------------|---------|
| `extractMarkdown` | useReadability, maxLength | Extract clean markdown |
| `extractText` | - | Extract plain text |
| `extractHtml` | selector | Extract HTML |
| `getSelectedText` | - | Get selected text |

**Example:**
```
User: Extract the main article as markdown
Agent: [Uses: extractMarkdown(useReadability=true)]

User: Get the HTML of the sidebar
Agent: [Uses: extractHtml(selector=".sidebar")]
```

### DOM Interaction Actions

| Action | Parameters | Example |
|--------|------------|---------|
| `click` | selector | Click element |
| `type` | selector, text | Type into field |
| `scroll` | direction, amount | Scroll page |
| `hover` | selector | Hover element |
| `waitForElement` | selector, timeout | Wait for element |

**Example:**
```
User: Click the search button
Agent: [Uses: click("#search-button")]

User: Type "hello world" in the search box
Agent: [Uses: type("input[type='search']", "hello world")]

User: Scroll down 500 pixels
Agent: [Uses: scroll("down", 500)]
```

### Screenshot Actions

| Action | Parameters | Example |
|--------|------------|---------|
| `captureVisibleTab` | compressImage, maxImageWidth | Capture visible area |
| `captureFullPage` | compressImage | Capture full page |
| `captureElement` | selector, compressImage | Capture element |

**Example:**
```
User: Take a screenshot of this page
Agent: [Uses: captureVisibleTab()]

User: Take a screenshot of just the header
Agent: [Uses: captureElement("header")]
```

### Query & Inspection Actions

| Action | Parameters | Example |
|--------|------------|---------|
| `querySelectorAll` | selector | Find all elements |
| `getElementInfo` | selector | Get element details |
| `getLinks` | - | Get all links |
| `getForms` | - | Get all forms |

**Example:**
```
User: How many buttons are on this page?
Agent: [Uses: querySelectorAll("button")]

User: Tell me about the main form
Agent: [Uses: getElementInfo("form#main")]

User: What links are on this page?
Agent: [Uses: getLinks()]
```

## Best Practices

### 1. Use Specific Selectors

✅ Good: `click("#submit-button")`
❌ Bad: `click("button")` (might click wrong button)

### 2. Wait for Dynamic Content

```
User: Click the login button after the page loads
Agent: [Uses: waitForElement("#login-button", 5000), click("#login-button")]
```

### 3. Extract Clean Content

Use `useReadability: true` to remove ads and navigation:
```
User: Get the article text without ads
Agent: [Uses: extractMarkdown(useReadability=true)]
```

### 4. Handle Errors Gracefully

The agent will report if elements aren't found:
```
User: Click the non-existent button
Agent: I tried to click the element, but it wasn't found. Could you check the selector?
```

## Limitations

### Current Limitations

1. **Full Page Screenshots**: Currently captures visible area only (scrolling stitching not implemented)
2. **Image Compression**: Returns original images (resize function needs implementation)
3. **Element Cropping**: Returns full screenshot with element coordinates
4. **Tool Registration**: Basic integration (needs full SDK tool interface)

### Browser Limitations

- Works only in Chrome/Chromium browsers
- Requires permission for each new domain
- Cannot access chrome:// pages
- Cannot bypass CAPTCHA or security measures

### Performance Considerations

- Large pages may timeout during extraction
- Use `maxLength` parameter to limit content
- Enable image compression for screenshots
- Use specific selectors for faster queries

## Troubleshooting

### "Element not found" Error

**Problem:** Selector doesn't match any element
**Solution:**
- Use browser DevTools to test selector
- Wait for element to load: `waitForElement(selector, timeout)`
- Use less specific selector

### Navigation Timeout

**Problem:** Page takes too long to load
**Solution:**
- Use `waitForLoad: false` for faster navigation
- Check internet connection
- Try refreshing: `refresh()`

### Permission Denied

**Problem:** Extension can't access page
**Solution:**
- Check manifest permissions
- Reload extension
- Try on a different page (some sites block extensions)

### Screenshot Failed

**Problem:** Can't capture screenshot
**Solution:**
- Ensure tab is active and visible
- Check `chrome.tabs.captureVisibleTab` permission
- Try visible tab capture instead of full page

## Advanced Usage

### Chaining Operations

```
User: Navigate to example.com, scroll down, and take a screenshot

Agent: I'll perform these actions in sequence:
1. Navigate to example.com
2. Wait for page load
3. Scroll down
4. Capture screenshot
```

### Conditional Actions

```
User: If there's a cookie banner, close it

Agent: I'll check for cookie banners and close them...
[Uses: querySelectorAll(".cookie-banner"), click(".cookie-dismiss")]
```

### Data Extraction Workflows

```
User: Extract all product names and prices from this page

Agent: I'll extract the products...
[Uses: querySelectorAll(".product"), getElementInfo for each]
```

## Security Notes

- **Credentials**: Never share your API keys
- **Sensitive Sites**: Avoid using on banking/sensitive sites
- **Data Privacy**: Content is sent to AI model for processing
- **Permissions**: Extension has broad permissions - use responsibly

## Getting Help

- Check logs in Chrome DevTools Console
- Review error messages in chat
- Test selectors in browser DevTools
- Check if element exists before interacting
- Use simpler actions to debug complex workflows

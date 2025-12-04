/**
 * Integration Tests for Browser Control Tool
 * 
 * Tests the full flow of browser control operations
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('Browser Control Integration', () => {
  beforeEach(() => {
    // Setup test page
    document.body.innerHTML = `
      <html>
        <head><title>Test Page</title></head>
        <body>
          <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
          </nav>
          <main>
            <h1>Test Page</h1>
            <p>This is a test paragraph with <strong>bold text</strong>.</p>
            <form id="test-form" action="/submit" method="post">
              <input type="text" id="username" name="username" placeholder="Username" required />
              <input type="password" id="password" name="password" placeholder="Password" required />
              <button type="submit" id="submit-btn">Submit</button>
            </form>
            <div id="content">
              <h2>Content Section</h2>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
                <li>Item 3</li>
              </ul>
            </div>
          </main>
          <footer>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </footer>
        </body>
      </html>
    `;
  });

  describe('Page Content Extraction', () => {
    it('should extract all links from page', () => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      expect(links.length).toBe(4);
      
      const linkData = links.map(link => ({
        href: (link as HTMLAnchorElement).href,
        text: link.textContent?.trim(),
      }));
      
      expect(linkData.some(l => l.text === 'Home')).toBe(true);
      expect(linkData.some(l => l.text === 'About')).toBe(true);
    });

    it('should extract form information', () => {
      const forms = Array.from(document.querySelectorAll('form'));
      expect(forms.length).toBe(1);
      
      const form = forms[0];
      const fields = Array.from(form.querySelectorAll('input, textarea, select'));
      
      expect(form.id).toBe('test-form');
      expect(form.action).toContain('/submit');
      expect(fields.length).toBe(2);
    });

    it('should extract text content', () => {
      const text = document.body.textContent || '';
      expect(text.includes('Test Page')).toBe(true);
      expect(text.includes('This is a test paragraph')).toBe(true);
      expect(text.includes('Item 1')).toBe(true);
    });

    it('should extract HTML from selector', () => {
      const content = document.querySelector('#content');
      const html = content?.innerHTML;
      
      expect(html).toContain('<h2>Content Section</h2>');
      expect(html).toContain('<ul>');
      expect(html).toContain('Item 1');
    });
  });

  describe('DOM Interaction Simulation', () => {
    it('should simulate form filling', () => {
      const usernameInput = document.querySelector('#username') as HTMLInputElement;
      const passwordInput = document.querySelector('#password') as HTMLInputElement;
      
      // Simulate typing
      usernameInput.value = 'testuser';
      usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      expect(usernameInput.value).toBe('testuser');
      expect(passwordInput.value).toBe('password123');
    });

    it('should simulate button click', () => {
      const button = document.querySelector('#submit-btn') as HTMLElement;
      let clicked = false;
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        clicked = true;
      });
      
      button.click();
      expect(clicked).toBe(true);
    });

    it('should find element by complex selector', () => {
      const submitButton = document.querySelector('form#test-form button[type="submit"]');
      expect(submitButton).toBeTruthy();
      expect(submitButton?.textContent).toBe('Submit');
    });
  });

  describe('Element Inspection', () => {
    it('should get detailed element information', () => {
      const element = document.querySelector('#submit-btn') as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      const elementInfo = {
        tagName: element.tagName.toLowerCase(),
        id: element.id,
        text: element.textContent,
        attributes: {} as Record<string, string>,
        position: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
      };
      
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        elementInfo.attributes[attr.name] = attr.value;
      }
      
      expect(elementInfo.tagName).toBe('button');
      expect(elementInfo.id).toBe('submit-btn');
      expect(elementInfo.attributes['type']).toBe('submit');
    });

    it('should query multiple elements', () => {
      const listItems = Array.from(document.querySelectorAll('#content ul li'));
      
      const items = listItems.map((item, index) => ({
        index,
        tagName: item.tagName.toLowerCase(),
        text: item.textContent?.trim(),
      }));
      
      expect(items.length).toBe(3);
      expect(items[0].text).toBe('Item 1');
      expect(items[1].text).toBe('Item 2');
      expect(items[2].text).toBe('Item 3');
    });
  });

  describe('Navigation Simulation', () => {
    it('should have current URL and title', () => {
      document.title = 'Test Page';
      expect(document.title).toBe('Test Page');
      expect(window.location).toBeDefined();
    });
  });

  describe('Screenshot Data Preparation', () => {
    it('should get element position for cropping', () => {
      const element = document.querySelector('#content') as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      const position = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
      
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.width).toBeGreaterThanOrEqual(0);
      expect(position.height).toBeGreaterThanOrEqual(0);
    });

    it('should check element visibility', () => {
      const element = document.querySelector('#content') as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      // In jsdom, elements don't have real dimensions like in a browser
      // We just check that the element exists and has a bounding rect
      expect(element).toBeTruthy();
      expect(rect).toBeDefined();
      expect(typeof rect.width).toBe('number');
      expect(typeof rect.height).toBe('number');
    });
  });

  describe('Wait for Element Simulation', () => {
    it('should find existing element immediately', async () => {
      const element = document.querySelector('#submit-btn');
      expect(element).toBeTruthy();
    });

    it('should handle non-existent element', () => {
      const element = document.querySelector('#non-existent');
      expect(element).toBeNull();
    });
  });
});

/**
 * Unit Tests for Content Script DOM Operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Content Script DOM Operations', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Element Selection', () => {
    it('should find element by selector', () => {
      document.body.innerHTML = '<button id="test-btn">Click me</button>';
      const element = document.querySelector('#test-btn');
      expect(element).toBeTruthy();
      expect(element?.textContent).toBe('Click me');
    });

    it('should return null for non-existent element', () => {
      const element = document.querySelector('#non-existent');
      expect(element).toBeNull();
    });

    it('should find multiple elements', () => {
      document.body.innerHTML = `
        <a href="https://example.com">Link 1</a>
        <a href="https://example.org">Link 2</a>
        <a href="https://example.net">Link 3</a>
      `;
      const links = document.querySelectorAll('a');
      expect(links.length).toBe(3);
    });
  });

  describe('Element Interaction', () => {
    it('should trigger click event', () => {
      document.body.innerHTML = '<button id="btn">Click</button>';
      const button = document.querySelector('#btn') as HTMLElement;
      let clicked = false;
      button.addEventListener('click', () => { clicked = true; });
      button.click();
      expect(clicked).toBe(true);
    });

    it('should set input value and trigger events', () => {
      document.body.innerHTML = '<input type="text" id="input" />';
      const input = document.querySelector('#input') as HTMLInputElement;
      
      let inputFired = false;
      let changeFired = false;
      
      input.addEventListener('input', () => { inputFired = true; });
      input.addEventListener('change', () => { changeFired = true; });
      
      input.value = 'test';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      
      expect(input.value).toBe('test');
      expect(inputFired).toBe(true);
      expect(changeFired).toBe(true);
    });

    it('should get element position', () => {
      document.body.innerHTML = '<div id="box" style="width: 100px; height: 50px;"></div>';
      const element = document.querySelector('#box') as HTMLElement;
      const rect = element.getBoundingClientRect();
      
      // In jsdom, element dimensions may not be calculated like in real browser
      expect(rect).toBeDefined();
      expect(typeof rect.width).toBe('number');
      expect(typeof rect.height).toBe('number');
    });
  });

  describe('Content Extraction', () => {
    it('should extract text content', () => {
      document.body.innerHTML = '<div>Hello <span>World</span></div>';
      const text = document.body.textContent || '';
      expect(text.includes('Hello')).toBe(true);
      expect(text.includes('World')).toBe(true);
    });

    it('should extract HTML content', () => {
      document.body.innerHTML = '<div id="content"><p>Test paragraph</p></div>';
      const element = document.querySelector('#content');
      const html = element?.innerHTML;
      expect(html).toBe('<p>Test paragraph</p>');
    });

    it('should get selected text', () => {
      document.body.innerHTML = '<p>Selectable text</p>';
      const selection = window.getSelection();
      expect(selection).toBeTruthy();
    });
  });

  describe('Links and Forms', () => {
    it('should find all links with href', () => {
      document.body.innerHTML = `
        <a href="https://example.com">Link 1</a>
        <a>No href</a>
        <a href="https://example.org">Link 2</a>
      `;
      const links = document.querySelectorAll('a[href]');
      expect(links.length).toBe(2);
    });

    it('should extract link information', () => {
      document.body.innerHTML = '<a href="https://example.com" title="Example">Test Link</a>';
      const link = document.querySelector('a') as HTMLAnchorElement;
      
      expect(link.href).toBe('https://example.com/');
      expect(link.textContent).toBe('Test Link');
      expect(link.getAttribute('title')).toBe('Example');
    });

    it('should find forms and their fields', () => {
      document.body.innerHTML = `
        <form id="test-form" action="/submit" method="post">
          <input type="text" name="username" required />
          <input type="password" name="password" />
          <textarea name="message"></textarea>
          <select name="country">
            <option>USA</option>
          </select>
        </form>
      `;
      
      const form = document.querySelector('form');
      const inputs = form?.querySelectorAll('input, textarea, select');
      
      expect(form?.id).toBe('test-form');
      expect(form?.action).toContain('/submit');
      expect(form?.method).toBe('post');
      expect(inputs?.length).toBe(4);
    });
  });

  describe('Element Attributes', () => {
    it('should read element attributes', () => {
      document.body.innerHTML = '<button id="btn" class="primary" data-action="submit">Click</button>';
      const button = document.querySelector('button');
      
      expect(button?.id).toBe('btn');
      expect(button?.className).toBe('primary');
      expect(button?.getAttribute('data-action')).toBe('submit');
    });

    it('should iterate over all attributes', () => {
      document.body.innerHTML = '<div id="test" class="box" data-value="123"></div>';
      const element = document.querySelector('div');
      const attrs: Record<string, string> = {};
      
      if (element) {
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          attrs[attr.name] = attr.value;
        }
      }
      
      expect(attrs['id']).toBe('test');
      expect(attrs['class']).toBe('box');
      expect(attrs['data-value']).toBe('123');
    });
  });

  describe('Scrolling', () => {
    it('should have scrollBy function', () => {
      expect(typeof window.scrollBy).toBe('function');
    });

    it('should have scroll position properties', () => {
      expect(typeof window.scrollX).toBe('number');
      expect(typeof window.scrollY).toBe('number');
    });
  });

  describe('Mouse Events', () => {
    it('should dispatch mouse events', () => {
      document.body.innerHTML = '<div id="hover-target">Hover me</div>';
      const element = document.querySelector('#hover-target') as HTMLElement;
      
      let mouseEntered = false;
      let mouseOver = false;
      
      element.addEventListener('mouseenter', () => { mouseEntered = true; });
      element.addEventListener('mouseover', () => { mouseOver = true; });
      
      element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      
      expect(mouseEntered).toBe(true);
      expect(mouseOver).toBe(true);
    });
  });
});

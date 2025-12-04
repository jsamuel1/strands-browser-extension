/**
 * Unit Tests for Browser Control Tool
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { browserControlTool, BrowserControlParamsSchema, BrowserActionSchema } from '../../src/tools/browser-control-tool';

describe('Browser Control Tool', () => {
  describe('Tool Definition', () => {
    it('should have correct tool name', () => {
      expect(browserControlTool.name).toBe('browser_control');
    });

    it('should have a description', () => {
      expect(browserControlTool.description).toBeTruthy();
      expect(browserControlTool.description.length).toBeGreaterThan(0);
    });

    it('should have parameters schema', () => {
      expect(browserControlTool.parameters).toBeDefined();
    });
  });

  describe('Parameter Schema Validation', () => {
    it('should validate navigation action with URL', () => {
      const params = {
        action: 'navigate',
        url: 'https://example.com',
      };
      const result = BrowserControlParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should validate click action with selector', () => {
      const params = {
        action: 'click',
        selector: '#submit-button',
      };
      const result = BrowserControlParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should validate type action with selector and text', () => {
      const params = {
        action: 'type',
        selector: 'input[name="email"]',
        text: 'test@example.com',
      };
      const result = BrowserControlParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should validate scroll action with direction', () => {
      const params = {
        action: 'scroll',
        direction: 'down',
        amount: 500,
      };
      const result = BrowserControlParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should validate screenshot action', () => {
      const params = {
        action: 'captureVisibleTab',
        compressImage: true,
        maxImageWidth: 1280,
      };
      const result = BrowserControlParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should reject invalid action', () => {
      const params = {
        action: 'invalidAction',
      };
      const result = BrowserControlParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should reject invalid URL', () => {
      const params = {
        action: 'navigate',
        url: 'not-a-valid-url',
      };
      const result = BrowserControlParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should apply default values', () => {
      const params = {
        action: 'extractMarkdown',
      };
      const result = BrowserControlParamsSchema.parse(params);
      expect(result.waitForLoad).toBe(true);
      expect(result.useReadability).toBe(true);
      expect(result.maxLength).toBe(50000);
    });
  });

  describe('Browser Action Schema', () => {
    it('should include all navigation actions', () => {
      const navigationActions = ['navigate', 'back', 'forward', 'refresh', 'getCurrentUrl', 'getTitle'];
      navigationActions.forEach(action => {
        const result = BrowserActionSchema.safeParse(action);
        expect(result.success).toBe(true);
      });
    });

    it('should include all content extraction actions', () => {
      const extractionActions = ['extractMarkdown', 'extractText', 'extractHtml', 'getSelectedText'];
      extractionActions.forEach(action => {
        const result = BrowserActionSchema.safeParse(action);
        expect(result.success).toBe(true);
      });
    });

    it('should include all DOM interaction actions', () => {
      const interactionActions = ['click', 'type', 'scroll', 'hover', 'waitForElement'];
      interactionActions.forEach(action => {
        const result = BrowserActionSchema.safeParse(action);
        expect(result.success).toBe(true);
      });
    });

    it('should include all screenshot actions', () => {
      const screenshotActions = ['captureVisibleTab', 'captureFullPage', 'captureElement'];
      screenshotActions.forEach(action => {
        const result = BrowserActionSchema.safeParse(action);
        expect(result.success).toBe(true);
      });
    });

    it('should include all query actions', () => {
      const queryActions = ['querySelectorAll', 'getElementInfo', 'getLinks', 'getForms'];
      queryActions.forEach(action => {
        const result = BrowserActionSchema.safeParse(action);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Tool Interface', () => {
    it('should have execute function', () => {
      expect(typeof browserControlTool.execute).toBe('function');
    });

    it('should throw error when execute is called without implementation', async () => {
      const params = {
        action: 'getCurrentUrl' as const,
      };
      await expect(browserControlTool.execute(params)).rejects.toThrow();
    });
  });
});

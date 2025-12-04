/**
 * Test setup - Mock Chrome APIs
 */

import { vi } from 'vitest';

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    sendMessage: vi.fn((message, callback) => {
      // Mock response
      callback({ success: true });
      return Promise.resolve({ success: true });
    }),
    lastError: null,
  },
  tabs: {
    query: vi.fn(() => Promise.resolve([{ id: 1, url: 'https://example.com', title: 'Example' }])),
    update: vi.fn(() => Promise.resolve({})),
    goBack: vi.fn(() => Promise.resolve()),
    goForward: vi.fn(() => Promise.resolve()),
    reload: vi.fn(() => Promise.resolve()),
    get: vi.fn(() => Promise.resolve({ id: 1, windowId: 1 })),
    captureVisibleTab: vi.fn(() => Promise.resolve('data:image/png;base64,mockimage')),
    sendMessage: vi.fn(() => Promise.resolve({ success: true })),
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  scripting: {
    executeScript: vi.fn(() => Promise.resolve([])),
  },
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
    },
  },
};

// @ts-ignore
global.chrome = mockChrome;

// Mock window object enhancements
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.chrome = mockChrome;
}

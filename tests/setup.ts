/**
 * Test setup file
 * Runs before all tests to set up global mocks and environment
 */

import { vi } from 'vitest'

// Mock Chrome extension APIs
globalThis.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
  },
  sidePanel: {
    open: vi.fn(),
    setOptions: vi.fn(),
  },
  action: {
    setIcon: vi.fn(),
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
} as any

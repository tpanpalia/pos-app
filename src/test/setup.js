import '@testing-library/jest-dom'

// Mock IndexedDB
global.indexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          get: vi.fn(),
          getAll: vi.fn(),
          createIndex: vi.fn()
        }))
      })),
      createObjectStore: vi.fn(() => ({
        createIndex: vi.fn()
      }))
    }
  }))
}

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
})
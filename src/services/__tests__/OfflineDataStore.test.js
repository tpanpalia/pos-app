import { OfflineDataStore } from '../OfflineDataStore'

// Mock IndexedDB more thoroughly
const mockDB = {
  transaction: vi.fn(() => ({
    objectStore: vi.fn(() => ({
      add: vi.fn(() => Promise.resolve()),
      get: vi.fn(() => Promise.resolve()),
      getAll: vi.fn(() => ({ 
        onsuccess: null,
        result: []
      })),
      index: vi.fn(() => ({
        getAll: vi.fn(() => ({
          onsuccess: null,
          result: []
        }))
      }))
    }))
  })),
  createObjectStore: vi.fn(() => ({
    createIndex: vi.fn()
  }))
}

if (!global.indexedDB) {
  global.indexedDB = {}
}
global.indexedDB.open = vi.fn(() => ({
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null,
  result: mockDB
}))

describe('OfflineDataStore', () => {
  let dataStore

  beforeEach(() => {
    dataStore = new OfflineDataStore()
    vi.clearAllMocks()
  })

  test('initializes with correct default values', () => {
    expect(dataStore.db).toBeNull()
    expect(dataStore.syncQueue).toEqual([])
    expect(dataStore.maxRetries).toBe(3)
    expect(dataStore.compressionEnabled).toBe(true)
  })

  test('generates unique transaction IDs', () => {
    const id1 = dataStore.generateTransactionId()
    const id2 = dataStore.generateTransactionId()
    
    expect(id1).toMatch(/^tx-\d+-[a-z0-9]+$/)
    expect(id2).toMatch(/^tx-\d+-[a-z0-9]+$/)
    expect(id1).not.toBe(id2)
  })

  test('manages memory cache with LRU eviction', () => {
    // Set small cache size for testing
    dataStore.maxCacheSize = 2
    
    dataStore.updateMemoryCache('products', '1', { name: 'Product 1' })
    dataStore.updateMemoryCache('products', '2', { name: 'Product 2' })
    dataStore.updateMemoryCache('products', '3', { name: 'Product 3' })
    
    // Should evict oldest entry
    expect(dataStore.memoryCache.size).toBe(2)
    expect(dataStore.getFromMemoryCache('products', '1')).toBeNull()
    expect(dataStore.getFromMemoryCache('products', '3')).toBeTruthy()
  })

  test('handles object pooling correctly', () => {
    const obj1 = dataStore.getPooledObject('order')
    const obj2 = dataStore.getPooledObject('order')
    
    expect(obj1).toHaveProperty('id')
    expect(obj1).toHaveProperty('items')
    expect(obj1).toHaveProperty('total')
    
    // Return to pool and get again
    dataStore.returnToPool('order', obj1)
    const obj3 = dataStore.getPooledObject('order')
    
    expect(obj3).toBe(obj1) // Should reuse pooled object
  })

  test('provides mock products when database is empty', async () => {
    const products = await dataStore.getProducts()
    
    expect(products).toHaveLength(6)
    expect(products[0]).toHaveProperty('name', 'Burger')
    expect(products[0]).toHaveProperty('category', 'Main')
  })

  test('cleans up memory cache based on age', () => {
    dataStore.updateMemoryCache('products', '1', { name: 'Product 1' })
    
    // Manually set old timestamp
    const cacheKey = 'products:1'
    dataStore.memoryCache.get(cacheKey).timestamp = Date.now() - (6 * 60 * 1000) // 6 minutes ago
    
    dataStore.cleanupMemoryCache()
    
    expect(dataStore.memoryCache.has(cacheKey)).toBe(false)
  })
})
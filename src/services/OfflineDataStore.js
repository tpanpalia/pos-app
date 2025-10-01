import { DataCompression } from '../utils/DataCompression'
import { StorageMonitor } from './StorageMonitor'

export class OfflineDataStore {
  constructor() {
    this.db = null
    this.syncQueue = []
    this.isOnline = navigator.onLine
    this.retryCount = 0
    this.maxRetries = 3
    this.transactionLog = []
    this.objectPool = new Map()
    this.memoryCache = new Map()
    this.maxCacheSize = 100
    this.storageMonitor = new StorageMonitor()
    this.compressionEnabled = true
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('POSDatabase', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        this.startSyncWorker()
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' })
          orderStore.createIndex('timestamp', 'timestamp')
          orderStore.createIndex('status', 'status')
        }
        
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' })
          productStore.createIndex('category', 'category')
          productStore.createIndex('name', 'name')
          productStore.createIndex('categoryPrice', ['category', 'price'])
          productStore.createIndex('nameAvailability', ['name', 'available'])
        }
        
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
        }
      }
    })
  }

  async saveOrder(order) {
    const transactionId = this.generateTransactionId()
    
    try {
      await this.beginTransaction(transactionId, 'saveOrder', { order })
      
      const transaction = this.db.transaction(['orders', 'syncQueue'], 'readwrite')
      
      const orderData = this.compressionEnabled ? DataCompression.compress(order) : order
      await transaction.objectStore('orders').add({ ...order, data: orderData })
      await transaction.objectStore('syncQueue').add({
        type: 'order',
        data: orderData,
        timestamp: Date.now()
      })
      
      await this.commitTransaction(transactionId)
      this.updateMemoryCache('orders', order.id, order)
      
      if (this.isOnline) {
        this.syncToServer()
      }
    } catch (error) {
      await this.rollbackTransaction(transactionId)
      console.error('Failed to save order:', error)
      throw error
    }
  }

  async getOrders() {
    const transaction = this.db.transaction(['orders'], 'readonly')
    const store = transaction.objectStore('orders')
    const index = store.index('timestamp')
    
    return new Promise((resolve, reject) => {
      const request = index.getAll()
      request.onsuccess = () => resolve(request.result.reverse())
      request.onerror = () => reject(request.error)
    })
  }

  async getProducts() {
    if (!this.db) return this.getMockProducts()
    
    const transaction = this.db.transaction(['products'], 'readonly')
    const store = transaction.objectStore('products')
    
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const products = request.result
        resolve(products.length > 0 ? products : this.getMockProducts())
      }
      request.onerror = () => reject(request.error)
    })
  }

  getMockProducts() {
    return [
      { id: '1', name: 'Burger', price: 12.99, category: 'Main' },
      { id: '2', name: 'Fries', price: 4.99, category: 'Sides' },
      { id: '3', name: 'Soda', price: 2.99, category: 'Drinks' },
      { id: '4', name: 'Pizza', price: 15.99, category: 'Main' },
      { id: '5', name: 'Salad', price: 8.99, category: 'Main' },
      { id: '6', name: 'Coffee', price: 3.99, category: 'Drinks' }
    ]
  }

  async syncToServer() {
    if (!this.isOnline || this.retryCount >= this.maxRetries) return
    
    try {
      const transaction = this.db.transaction(['syncQueue'], 'readonly')
      const store = transaction.objectStore('syncQueue')
      const request = store.getAll()
      
      request.onsuccess = async () => {
        const items = request.result
        for (const item of items) {
          await this.syncItem(item)
        }
        this.retryCount = 0
      }
    } catch (error) {
      this.retryCount++
      setTimeout(() => this.syncToServer(), Math.pow(2, this.retryCount) * 1000)
    }
  }

  async syncItem(item) {
    // Simulate API call
    console.log('Syncing item:', item)
    
    // Remove from sync queue after successful sync
    const transaction = this.db.transaction(['syncQueue'], 'readwrite')
    await transaction.objectStore('syncQueue').delete(item.id)
  }

  startSyncWorker() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncToServer()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
    
    // Periodic sync attempt
    setInterval(() => {
      if (this.isOnline) this.syncToServer()
      this.cleanupMemoryCache()
    }, 30000)
  }

  generateTransactionId() {
    return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  async beginTransaction(id, operation, data) {
    this.transactionLog.push({
      id,
      operation,
      data,
      timestamp: Date.now(),
      status: 'pending'
    })
  }

  async commitTransaction(id) {
    const tx = this.transactionLog.find(t => t.id === id)
    if (tx) {
      tx.status = 'committed'
      tx.completedAt = Date.now()
    }
  }

  async rollbackTransaction(id) {
    const tx = this.transactionLog.find(t => t.id === id)
    if (tx) {
      tx.status = 'rolled_back'
      // Implement rollback logic based on operation type
      console.log('Rolling back transaction:', tx)
    }
  }

  updateMemoryCache(store, key, value) {
    const cacheKey = `${store}:${key}`
    
    if (this.memoryCache.size >= this.maxCacheSize) {
      // Remove oldest entry (LRU)
      const firstKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(firstKey)
    }
    
    this.memoryCache.set(cacheKey, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    })
  }

  getFromMemoryCache(store, key) {
    const cacheKey = `${store}:${key}`
    const cached = this.memoryCache.get(cacheKey)
    
    if (cached) {
      cached.accessCount++
      cached.lastAccessed = Date.now()
      return cached.value
    }
    
    return null
  }

  cleanupMemoryCache() {
    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutes
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.memoryCache.delete(key)
      }
    }
  }

  getPooledObject(type) {
    const pool = this.objectPool.get(type) || []
    return pool.pop() || this.createObject(type)
  }

  returnToPool(type, obj) {
    if (!this.objectPool.has(type)) {
      this.objectPool.set(type, [])
    }
    
    const pool = this.objectPool.get(type)
    if (pool.length < 10) { // Max pool size
      this.resetObject(obj)
      pool.push(obj)
    }
  }

  createObject(type) {
    switch (type) {
      case 'order':
        return { id: null, items: [], total: 0, timestamp: null, status: 'pending' }
      case 'cartItem':
        return { id: null, name: '', price: 0, quantity: 0 }
      default:
        return {}
    }
  }

  resetObject(obj) {
    Object.keys(obj).forEach(key => {
      if (Array.isArray(obj[key])) {
        obj[key].length = 0
      } else {
        obj[key] = null
      }
    })
  }

  async pruneOldData() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    const transaction = this.db.transaction(['orders'], 'readwrite')
    const store = transaction.objectStore('orders')
    const index = store.index('timestamp')
    
    const range = IDBKeyRange.upperBound(thirtyDaysAgo)
    const request = index.openCursor(range)
    
    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }
  }

  async searchProducts(query, category = null) {
    const transaction = this.db.transaction(['products'], 'readonly')
    const store = transaction.objectStore('products')
    
    if (category) {
      const index = store.index('category')
      const range = IDBKeyRange.only(category)
      return new Promise((resolve) => {
        const request = index.getAll(range)
        request.onsuccess = () => {
          const results = request.result.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase())
          )
          resolve(results)
        }
      })
    }
    
    return new Promise((resolve) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const results = request.result.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase())
        )
        resolve(results)
      }
    })
  }
}
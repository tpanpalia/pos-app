export class SyncEngine {
  constructor(dataStore) {
    this.dataStore = dataStore
    this.syncInProgress = false
    this.lastSyncTime = localStorage.getItem('lastSyncTime') || 0
    this.conflictResolver = new ConflictResolver()
  }

  async startSync() {
    if (this.syncInProgress || !navigator.onLine) return
    
    this.syncInProgress = true
    
    try {
      await this.syncOrders()
      await this.syncInventory()
      this.lastSyncTime = Date.now()
      localStorage.setItem('lastSyncTime', this.lastSyncTime.toString())
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      this.syncInProgress = false
    }
  }

  async syncOrders() {
    const localOrders = await this.dataStore.getOrdersSince(this.lastSyncTime)
    const serverOrders = await this.fetchServerOrders(this.lastSyncTime)
    
    for (const order of localOrders) {
      await this.pushOrderToServer(order)
    }
    
    for (const order of serverOrders) {
      const conflict = await this.detectOrderConflict(order)
      if (conflict) {
        const resolved = await this.conflictResolver.resolveOrder(conflict)
        await this.dataStore.saveOrder(resolved)
      } else {
        await this.dataStore.saveOrder(order)
      }
    }
  }

  async syncInventory() {
    // Inventory sync implementation
    console.log('Syncing inventory...')
  }

  async fetchServerOrders(since) {
    // Simulate API call
    return []
  }

  async pushOrderToServer(order) {
    // Simulate API call
    console.log('Pushing order to server:', order.id)
  }

  async detectOrderConflict(order) {
    const local = await this.dataStore.getOrder(order.id)
    if (!local) return null
    
    if (local.lastModified !== order.lastModified) {
      return { local, server: order }
    }
    
    return null
  }
}

class ConflictResolver {
  async resolveOrder(conflict) {
    // Simple last-write-wins for now
    return conflict.server.lastModified > conflict.local.lastModified 
      ? conflict.server 
      : conflict.local
  }
}
export class StorageMonitor {
  constructor() {
    this.warningThreshold = 0.8 // 80%
    this.criticalThreshold = 0.95 // 95%
    this.listeners = []
  }

  async checkStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage / estimate.quota
      
      if (usage > this.criticalThreshold) {
        this.notifyListeners('critical', usage)
      } else if (usage > this.warningThreshold) {
        this.notifyListeners('warning', usage)
      }
      
      return { usage, quota: estimate.quota, used: estimate.usage }
    }
    
    return null
  }

  startMonitoring() {
    setInterval(() => {
      this.checkStorageUsage()
    }, 60000) // Check every minute
  }

  onStorageAlert(callback) {
    this.listeners.push(callback)
  }

  notifyListeners(level, usage) {
    this.listeners.forEach(callback => callback({ level, usage }))
  }
}
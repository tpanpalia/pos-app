export class ServiceWorkerManager {
  constructor() {
    this.registration = null
    this.isUpdateAvailable = false
  }

  async register(scriptURL = '/sw.js') {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register(scriptURL)
        this.setupUpdateHandling()
        return this.registration
      } catch (error) {
        console.error('SW registration failed:', error)
        this.registration = null
      }
    }
  }

  setupUpdateHandling() {
    if (this.registration) {
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound()
      })
    }
  }

  handleUpdateFound() {
    if (this.registration?.waiting) {
      this.isUpdateAvailable = true
    }
  }

  sendMessage(message) {
    if (this.registration?.active) {
      this.registration.active.postMessage(message)
    } else {
      console.warn('Service worker not registered')
    }
  }

  async checkForUpdates() {
    if (this.registration) {
      await this.registration.update()
    } else {
      console.warn('Service worker not registered')
    }
  }

  applyUpdate() {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  async unregister() {
    if (this.registration) {
      return this.registration.unregister()
    }
  }
}
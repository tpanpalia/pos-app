export class ServiceWorkerManager {
  static async register() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('SW registered:', registration)
        return registration
      } catch (error) {
        console.error('SW registration failed:', error)
      }
    }
  }

  static async unregister() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        return registration.unregister()
      }
    }
  }
}
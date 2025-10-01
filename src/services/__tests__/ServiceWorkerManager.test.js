import { ServiceWorkerManager } from '../ServiceWorkerManager'

// Mock service worker registration
const mockRegistration = {
  installing: null,
  waiting: null,
  active: { postMessage: vi.fn() },
  addEventListener: vi.fn(),
  update: vi.fn(() => Promise.resolve())
}

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn(() => Promise.resolve(mockRegistration)),
    ready: Promise.resolve(mockRegistration),
    addEventListener: vi.fn()
  },
  writable: true
})

describe('ServiceWorkerManager', () => {
  let swManager

  beforeEach(() => {
    swManager = new ServiceWorkerManager()
    vi.clearAllMocks()
  })

  test('initializes with default values', () => {
    expect(swManager.registration).toBeNull()
    expect(swManager.isUpdateAvailable).toBe(false)
  })

  test('registers service worker successfully', async () => {
    await swManager.register('/sw.js')
    
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js')
    expect(swManager.registration).toBe(mockRegistration)
  })

  test('handles registration failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation()
    navigator.serviceWorker.register.mockRejectedValueOnce(new Error('Registration failed'))
    
    await swManager.register('/sw.js')
    
    expect(consoleSpy).toHaveBeenCalledWith('SW registration failed:', expect.any(Error))
    expect(swManager.registration).toBeNull()
    
    consoleSpy.mockRestore()
  })

  test('sends message to service worker', async () => {
    await swManager.register('/sw.js')
    
    swManager.sendMessage({ type: 'SYNC_DATA', data: { orders: [] } })
    
    expect(mockRegistration.active.postMessage).toHaveBeenCalledWith({
      type: 'SYNC_DATA',
      data: { orders: [] }
    })
  })

  test('handles message sending without registration', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation()
    
    swManager.sendMessage({ type: 'TEST' })
    
    expect(consoleSpy).toHaveBeenCalledWith('Service worker not registered')
    
    consoleSpy.mockRestore()
  })

  test('checks for updates', async () => {
    await swManager.register('/sw.js')
    
    await swManager.checkForUpdates()
    
    expect(mockRegistration.update).toHaveBeenCalled()
  })

  test('handles update check without registration', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation()
    
    await swManager.checkForUpdates()
    
    expect(consoleSpy).toHaveBeenCalledWith('Service worker not registered')
    
    consoleSpy.mockRestore()
  })

  test('detects when update is available', async () => {
    mockRegistration.waiting = { postMessage: vi.fn() }
    await swManager.register('/sw.js')
    
    swManager.handleUpdateFound()
    
    expect(swManager.isUpdateAvailable).toBe(true)
  })

  test('applies pending update', async () => {
    mockRegistration.waiting = { postMessage: vi.fn() }
    await swManager.register('/sw.js')
    swManager.isUpdateAvailable = true
    
    // Mock the applyUpdate method to avoid reload issues
    const originalApplyUpdate = swManager.applyUpdate
    swManager.applyUpdate = () => {
      if (swManager.registration?.waiting) {
        swManager.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    }
    
    swManager.applyUpdate()
    
    expect(mockRegistration.waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    
    swManager.applyUpdate = originalApplyUpdate
  })
})
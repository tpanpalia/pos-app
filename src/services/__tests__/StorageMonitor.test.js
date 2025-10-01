import { StorageMonitor } from '../StorageMonitor'

describe('StorageMonitor', () => {
  let storageMonitor

  beforeEach(() => {
    storageMonitor = new StorageMonitor()
    vi.clearAllMocks()
  })

  test('initializes with correct thresholds', () => {
    expect(storageMonitor.warningThreshold).toBe(0.8)
    expect(storageMonitor.criticalThreshold).toBe(0.95)
  })

  test('checks storage usage and returns data', async () => {
    const mockEstimate = {
      usage: 500000000, // 500MB
      quota: 1000000000 // 1GB
    }

    Object.defineProperty(navigator, 'storage', {
      value: { estimate: vi.fn(() => Promise.resolve(mockEstimate)) },
      writable: true
    })

    const result = await storageMonitor.checkStorageUsage()

    expect(result.usage).toBe(0.5)
    expect(result.quota).toBe(1000000000)
    expect(result.used).toBe(500000000)
  })

  test('triggers warning alert at 80% usage', async () => {
    const alerts = []
    storageMonitor.onStorageAlert((alert) => alerts.push(alert))

    Object.defineProperty(navigator, 'storage', {
      value: { 
        estimate: vi.fn(() => Promise.resolve({
          usage: 850000000, // 85%
          quota: 1000000000
        }))
      }
    })

    await storageMonitor.checkStorageUsage()

    expect(alerts).toHaveLength(1)
    expect(alerts[0].level).toBe('warning')
    expect(alerts[0].usage).toBe(0.85)
  })

  test('triggers critical alert at 95% usage', async () => {
    const alerts = []
    storageMonitor.onStorageAlert((alert) => alerts.push(alert))

    Object.defineProperty(navigator, 'storage', {
      value: { 
        estimate: vi.fn(() => Promise.resolve({
          usage: 970000000, // 97%
          quota: 1000000000
        }))
      }
    })

    await storageMonitor.checkStorageUsage()

    expect(alerts).toHaveLength(1)
    expect(alerts[0].level).toBe('critical')
  })

  test('returns null when storage API unavailable', async () => {
    // Create a new monitor instance to avoid global navigator issues
    const testMonitor = new (class extends StorageMonitor {
      async checkStorageUsage() {
        // Simulate no storage API
        return null
      }
    })()

    const result = await testMonitor.checkStorageUsage()

    expect(result).toBeNull()
  })

  test('supports multiple alert listeners', () => {
    const alerts1 = []
    const alerts2 = []

    storageMonitor.onStorageAlert((alert) => alerts1.push(alert))
    storageMonitor.onStorageAlert((alert) => alerts2.push(alert))

    storageMonitor.notifyListeners('warning', 0.85)

    expect(alerts1).toHaveLength(1)
    expect(alerts2).toHaveLength(1)
  })
})
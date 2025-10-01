import { SyncEngine } from '../SyncEngine'

describe('SyncEngine', () => {
  let syncEngine
  let mockDataStore

  beforeEach(() => {
    mockDataStore = {
      getOrdersSince: vi.fn(() => Promise.resolve([])),
      getOrder: vi.fn(() => Promise.resolve(null)),
      saveOrder: vi.fn(() => Promise.resolve())
    }
    
    syncEngine = new SyncEngine(mockDataStore)
    vi.clearAllMocks()
    
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
    Storage.prototype.getItem = vi.fn(() => '0')
    Storage.prototype.setItem = vi.fn()
  })

  test('initializes with datastore and default values', () => {
    expect(syncEngine.dataStore).toBe(mockDataStore)
    expect(syncEngine.syncInProgress).toBe(false)
    expect(syncEngine.lastSyncTime).toBe(0)
  })

  test('skips sync when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false })
    
    await syncEngine.startSync()
    
    expect(mockDataStore.getOrdersSince).not.toHaveBeenCalled()
  })

  test('skips sync when already in progress', async () => {
    syncEngine.syncInProgress = true
    
    await syncEngine.startSync()
    
    expect(mockDataStore.getOrdersSince).not.toHaveBeenCalled()
  })

  test('performs full sync when online', async () => {
    syncEngine.fetchServerOrders = vi.fn(() => Promise.resolve([]))
    syncEngine.pushOrderToServer = vi.fn(() => Promise.resolve())
    
    mockDataStore.getOrdersSince.mockResolvedValue([
      { id: '1', name: 'Test Order' }
    ])

    await syncEngine.startSync()

    expect(mockDataStore.getOrdersSince).toHaveBeenCalled()
    expect(syncEngine.fetchServerOrders).toHaveBeenCalled()
    expect(localStorage.setItem).toHaveBeenCalledWith('lastSyncTime', expect.any(String))
  })

  test('handles sync errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation()
    mockDataStore.getOrdersSince.mockRejectedValue(new Error('Network error'))

    await syncEngine.startSync()

    expect(consoleSpy).toHaveBeenCalledWith('Sync failed:', expect.any(Error))
    expect(syncEngine.syncInProgress).toBe(false)
    
    consoleSpy.mockRestore()
  })

  test('detects order conflicts', async () => {
    const serverOrder = { id: '1', lastModified: 2000 }
    const localOrder = { id: '1', lastModified: 1000 }
    
    mockDataStore.getOrder.mockResolvedValue(localOrder)

    const conflict = await syncEngine.detectOrderConflict(serverOrder)

    expect(conflict).toEqual({
      local: localOrder,
      server: serverOrder
    })
  })

  test('returns null when no conflict exists', async () => {
    mockDataStore.getOrder.mockResolvedValue(null)

    const conflict = await syncEngine.detectOrderConflict({ id: '1' })

    expect(conflict).toBeNull()
  })

  test('resolves conflicts with last-write-wins', async () => {
    const conflict = {
      local: { id: '1', lastModified: 1000 },
      server: { id: '1', lastModified: 2000 }
    }

    const resolved = await syncEngine.conflictResolver.resolveOrder(conflict)

    expect(resolved).toBe(conflict.server) // Server is newer
  })
})
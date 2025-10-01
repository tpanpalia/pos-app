import { SyncWorker } from '../SyncWorker'

// Mock Worker constructor
global.Worker = class MockWorker {
  constructor(url) {
    this.url = url
    this.onmessage = null
    this.onerror = null
  }
  
  postMessage(data) {
    // Simulate worker response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data: { type: 'SYNC_COMPLETE', success: true } })
      }
    }, 10)
  }
  
  terminate() {
    this.terminated = true
  }
}

describe('SyncWorker', () => {
  let syncWorker

  beforeEach(() => {
    syncWorker = new SyncWorker()
    vi.clearAllMocks()
  })

  test('initializes with default values', () => {
    expect(syncWorker.worker).toBeNull()
    expect(syncWorker.isRunning).toBe(false)
  })

  test('starts worker successfully', () => {
    syncWorker.start('/sync-worker.js')
    
    expect(syncWorker.worker).toBeDefined()
    expect(syncWorker.isRunning).toBe(true)
  })

  test('handles worker messages', async () => {
    const messagePromise = new Promise((resolve) => {
      syncWorker.onMessage = (data) => {
        expect(data.type).toBe('SYNC_COMPLETE')
        expect(data.success).toBe(true)
        resolve()
      }
    })
    
    syncWorker.start('/sync-worker.js')
    syncWorker.postMessage({ type: 'START_SYNC' })
    
    await messagePromise
  })

  test('handles worker errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation()
    
    syncWorker.start('/sync-worker.js')
    
    // Simulate worker error
    const error = new Error('Worker error')
    syncWorker.worker.onerror(error)
    
    expect(consoleSpy).toHaveBeenCalledWith('Sync worker error:', error)
    
    consoleSpy.mockRestore()
  })

  test('posts message to worker', () => {
    const postMessageSpy = vi.fn()
    syncWorker.start('/sync-worker.js')
    syncWorker.worker.postMessage = postMessageSpy
    
    const message = { type: 'SYNC_ORDERS', data: [] }
    syncWorker.postMessage(message)
    
    expect(postMessageSpy).toHaveBeenCalledWith(message)
  })

  test('handles post message without worker', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation()
    
    syncWorker.postMessage({ type: 'TEST' })
    
    expect(consoleSpy).toHaveBeenCalledWith('Sync worker not started')
    
    consoleSpy.mockRestore()
  })

  test('terminates worker', () => {
    syncWorker.start('/sync-worker.js')
    const terminateSpy = vi.spyOn(syncWorker.worker, 'terminate')
    
    syncWorker.terminate()
    
    expect(terminateSpy).toHaveBeenCalled()
    expect(syncWorker.worker).toBeNull()
    expect(syncWorker.isRunning).toBe(false)
  })

  test('handles terminate without worker', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation()
    
    syncWorker.terminate()
    
    expect(consoleSpy).toHaveBeenCalledWith('Sync worker not started')
    
    consoleSpy.mockRestore()
  })

  test('queues sync job', () => {
    syncWorker.start('/sync-worker.js')
    const postMessageSpy = vi.spyOn(syncWorker, 'postMessage')
    
    const job = { type: 'orders', data: [{ id: '1' }] }
    syncWorker.queueSync(job)
    
    expect(postMessageSpy).toHaveBeenCalledWith({
      type: 'QUEUE_SYNC',
      job
    })
  })

  test('gets sync status', () => {
    syncWorker.start('/sync-worker.js')
    const postMessageSpy = vi.spyOn(syncWorker, 'postMessage')
    
    syncWorker.getStatus()
    
    expect(postMessageSpy).toHaveBeenCalledWith({ type: 'GET_STATUS' })
  })
})
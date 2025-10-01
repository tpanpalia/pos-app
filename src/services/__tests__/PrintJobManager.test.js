import { PrintJobManager } from '../PrintJobManager'

describe('PrintJobManager', () => {
  let printManager

  beforeEach(() => {
    printManager = new PrintJobManager()
    vi.clearAllMocks()
  })

  test('initializes with empty queue', () => {
    expect(printManager.printQueue).toEqual([])
    expect(printManager.isProcessing).toBe(false)
    expect(printManager.maxRetries).toBe(3)
  })

  test('queues receipt with correct priority', async () => {
    const order = {
      id: '123',
      items: [{ name: 'Burger', quantity: 1, price: 12.99 }],
      total: 12.99
    }

    // Mock processQueue to prevent auto-processing
    printManager.processQueue = vi.fn()
    
    await printManager.queueReceipt(order)

    expect(printManager.printQueue).toHaveLength(1)
    expect(printManager.printQueue[0]).toMatchObject({
      id: 'receipt-123',
      type: 'receipt',
      priority: 1,
      data: order
    })
  })

  test('queues kitchen order with higher priority', async () => {
    const order = {
      id: '123',
      items: [{ name: 'Burger', quantity: 1, price: 12.99 }],
      total: 12.99
    }

    // Mock processQueue to prevent auto-processing
    printManager.processQueue = vi.fn()
    
    await printManager.queueKitchenOrder(order)

    expect(printManager.printQueue).toHaveLength(1)
    expect(printManager.printQueue[0]).toMatchObject({
      id: 'kitchen-123',
      type: 'kitchen',
      priority: 3,
      data: order
    })
  })

  test('sorts queue by priority', async () => {
    const order = { id: '123', items: [], total: 0 }

    // Mock processQueue to prevent auto-processing
    printManager.processQueue = vi.fn()
    
    await printManager.queueReceipt(order) // Priority 1
    await printManager.queueKitchenOrder(order) // Priority 3

    expect(printManager.printQueue[0].type).toBe('kitchen') // Higher priority first
    expect(printManager.printQueue[1].type).toBe('receipt')
  })

  test('generates correct receipt template', () => {
    const order = {
      id: '123',
      items: [
        { name: 'Burger', quantity: 2, price: 12.99 },
        { name: 'Fries', quantity: 1, price: 4.99 }
      ],
      total: 30.97,
      timestamp: '2023-01-01T12:00:00Z'
    }

    const template = printManager.getTemplate('receipt')
    const content = printManager.formatContent(template, order)

    expect(content).toContain('RECEIPT')
    expect(content).toContain('Burger x2')
    expect(content).toContain('25.98')
    expect(content).toContain('30.97')
  })

  test('generates ESC/POS commands', () => {
    const content = 'Test receipt content'
    const escPos = printManager.generateESCPOS(content)

    expect(escPos).toContain('\x1B@') // Initialize printer
    expect(escPos).toContain('\x1Ba\x01') // Center align
    expect(escPos).toContain(content)
    expect(escPos).toContain('\x1Bd\x03') // Feed lines
  })

  test('tracks retry attempts', () => {
    const jobId = 'test-job-1'
    
    expect(printManager.retryAttempts.get(jobId)).toBeUndefined()
    
    printManager.retryAttempts.set(jobId, 1)
    expect(printManager.retryAttempts.get(jobId)).toBe(1)
  })

  test('provides queue status', async () => {
    const order = { id: '123', items: [], total: 0 }
    
    // Mock processQueue to prevent auto-processing
    printManager.processQueue = vi.fn()
    
    await printManager.queueReceipt(order)
    
    printManager.retryAttempts.set('failed-job', 5) // Exceeds max retries

    const status = printManager.getQueueStatus()
    
    expect(status.pending).toBe(1)
    expect(status.processing).toBe(false)
    expect(status.failed).toBe(1)
  })
})
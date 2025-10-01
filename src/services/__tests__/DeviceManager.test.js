import { DeviceManager } from '../DeviceManager'

describe('DeviceManager', () => {
  let deviceManager

  beforeEach(() => {
    deviceManager = new DeviceManager()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('generates unique device ID', () => {
    const id1 = deviceManager.generateDeviceId()
    const id2 = deviceManager.generateDeviceId()
    
    expect(id1).toMatch(/^device-\d+-[a-z0-9]+$/)
    expect(id1).not.toBe(id2)
  })

  test('starts discovery and finds devices', async () => {
    const discoveredDevices = []
    deviceManager.on('deviceDiscovered', (device) => {
      discoveredDevices.push(device)
    })

    deviceManager.startDiscovery()
    vi.advanceTimersByTime(1100)

    expect(discoveredDevices).toHaveLength(2)
    expect(discoveredDevices[0].type).toBe('kitchen')
    expect(discoveredDevices[1].type).toBe('printer')
  })

  test('handles device pairing', async () => {
    vi.useFakeTimers()
    
    const pairingPromise = deviceManager.pairWithDevice('test-device', '1234')
    
    vi.advanceTimersByTime(1000)
    
    const result = await pairingPromise
    
    expect(result.id).toBe('test-device')
    expect(result.paired).toBe(true)
    
    vi.useRealTimers()
  })

  test('rejects invalid pairing code', async () => {
    vi.useFakeTimers()
    
    const pairingPromise = deviceManager.pairWithDevice('test-device', 'wrong')
    
    vi.advanceTimersByTime(1000)
    
    await expect(pairingPromise).rejects.toThrow('Invalid pairing code')
    
    vi.useRealTimers()
  })

  test('sends order updates to kitchen devices', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation()
    
    deviceManager.connectedDevices.set('kitchen-1', {
      id: 'kitchen-1',
      type: 'kitchen',
      connected: true
    })

    deviceManager.sendOrderUpdate('order-123', 'preparing')

    expect(consoleSpy).toHaveBeenCalledWith(
      'Sending to kitchen-1:',
      expect.objectContaining({
        type: 'ORDER_UPDATE',
        orderId: 'order-123',
        status: 'preparing'
      })
    )
    
    consoleSpy.mockRestore()
  })

  test('handles device disconnection on heartbeat timeout', () => {
    const disconnectedDevices = []
    deviceManager.on('deviceDisconnected', (device) => {
      disconnectedDevices.push(device)
    })

    deviceManager.connectedDevices.set('old-device', {
      id: 'old-device',
      connected: true,
      lastSeen: Date.now() - 70000 // 70 seconds ago
    })

    deviceManager.sendHeartbeat()

    expect(disconnectedDevices).toHaveLength(1)
    expect(disconnectedDevices[0].id).toBe('old-device')
  })

  test('returns connected devices only', () => {
    deviceManager.connectedDevices.set('device1', { connected: true })
    deviceManager.connectedDevices.set('device2', { connected: false })

    const connected = deviceManager.getConnectedDevices()

    expect(connected).toHaveLength(1)
    expect(connected[0].connected).toBe(true)
  })
})
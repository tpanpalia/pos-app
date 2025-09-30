export class DeviceManager {
  constructor() {
    this.deviceId = this.generateDeviceId()
    this.connectedDevices = new Map()
    this.eventHandlers = new Map()
    this.isDiscovering = false
  }

  generateDeviceId() {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  async startDiscovery() {
    if (this.isDiscovering) return
    
    this.isDiscovering = true
    
    // Simulate device discovery via WebRTC or local network scanning
    this.simulateDeviceDiscovery()
    
    // Start broadcasting own presence
    this.broadcastPresence()
  }

  simulateDeviceDiscovery() {
    // In real implementation, this would use WebRTC peer discovery
    // or mDNS/Bonjour for local network scanning
    
    setTimeout(() => {
      const mockDevices = [
        { id: 'kitchen-display-1', type: 'kitchen', name: 'Kitchen Display' },
        { id: 'printer-1', type: 'printer', name: 'Receipt Printer' }
      ]
      
      mockDevices.forEach(device => {
        this.connectedDevices.set(device.id, {
          ...device,
          connected: true,
          lastSeen: Date.now()
        })
        
        this.emit('deviceDiscovered', device)
      })
    }, 1000)
  }

  broadcastPresence() {
    const presence = {
      deviceId: this.deviceId,
      type: 'pos-terminal',
      name: 'POS Terminal',
      timestamp: Date.now()
    }
    
    // In real implementation, broadcast via WebRTC data channels
    console.log('Broadcasting presence:', presence)
    
    // Simulate periodic heartbeat
    setInterval(() => {
      this.sendHeartbeat()
    }, 30000)
  }

  sendHeartbeat() {
    this.connectedDevices.forEach((device, deviceId) => {
      // Simulate heartbeat check
      if (Date.now() - device.lastSeen > 60000) {
        this.handleDeviceDisconnected(deviceId)
      }
    })
  }

  handleDeviceDisconnected(deviceId) {
    const device = this.connectedDevices.get(deviceId)
    if (device) {
      device.connected = false
      this.emit('deviceDisconnected', device)
    }
  }

  sendOrderUpdate(orderId, status) {
    const message = {
      type: 'ORDER_UPDATE',
      orderId,
      status,
      timestamp: Date.now(),
      from: this.deviceId
    }
    
    // Broadcast to all connected devices
    this.connectedDevices.forEach((device, deviceId) => {
      if (device.connected && device.type === 'kitchen') {
        this.sendMessage(deviceId, message)
      }
    })
  }

  sendMessage(deviceId, message) {
    // In real implementation, send via WebRTC data channel
    console.log(`Sending to ${deviceId}:`, message)
    
    // Simulate message delivery
    setTimeout(() => {
      this.emit('messageSent', { deviceId, message })
    }, 100)
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event).push(handler)
  }

  emit(event, data) {
    const handlers = this.eventHandlers.get(event) || []
    handlers.forEach(handler => handler(data))
  }

  getConnectedDevices() {
    return Array.from(this.connectedDevices.values())
      .filter(device => device.connected)
  }

  pairWithDevice(deviceId, pairingCode) {
    // Simulate QR code pairing
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (pairingCode === '1234') {
          const device = {
            id: deviceId,
            type: 'kitchen',
            name: 'Kitchen Display',
            paired: true,
            connected: true,
            lastSeen: Date.now()
          }
          
          this.connectedDevices.set(deviceId, device)
          this.emit('devicePaired', device)
          resolve(device)
        } else {
          reject(new Error('Invalid pairing code'))
        }
      }, 1000)
    })
  }
}
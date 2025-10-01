import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

// Mock all services
vi.mock('../services/OfflineDataStore', () => ({
  OfflineDataStore: vi.fn(() => ({
    init: vi.fn(),
    getOrders: vi.fn(() => Promise.resolve([])),
    saveOrder: vi.fn(() => Promise.resolve()),
    pruneOldData: vi.fn()
  }))
}))

vi.mock('../services/PrintJobManager', () => ({
  PrintJobManager: vi.fn(() => ({
    queueReceipt: vi.fn(() => Promise.resolve())
  }))
}))

vi.mock('../services/DeviceManager', () => ({
  DeviceManager: vi.fn(() => ({
    on: vi.fn(),
    startDiscovery: vi.fn(),
    sendOrderUpdate: vi.fn()
  }))
}))

vi.mock('../services/StorageMonitor', () => ({
  StorageMonitor: vi.fn(() => ({
    startMonitoring: vi.fn(),
    onStorageAlert: vi.fn()
  }))
}))

vi.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn()
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
  })

  test('renders main components', () => {
    render(<App />)
    
    expect(screen.getByText('POS System')).toBeInTheDocument()
    expect(screen.getByText('🟢 Online')).toBeInTheDocument()
  })

  test('shows offline status', () => {
    Object.defineProperty(navigator, 'onLine', { value: false })
    render(<App />)
    
    expect(screen.getByText('🔴 Offline')).toBeInTheDocument()
  })
})
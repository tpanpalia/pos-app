import React, { useState, useEffect } from 'react'
import ProductCatalog from './components/ProductCatalog'
import Cart from './components/Cart'
import LazyOrderQueue from './components/LazyOrderQueue'
import { OfflineDataStore } from './services/OfflineDataStore'
import { PrintJobManager } from './services/PrintJobManager'
import { DeviceManager } from './services/DeviceManager'
import { StorageMonitor } from './services/StorageMonitor'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import './App.css'

const dataStore = new OfflineDataStore()
const printManager = new PrintJobManager()
const deviceManager = new DeviceManager()
const storageMonitor = new StorageMonitor()

export default function App() {
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectedDevices, setConnectedDevices] = useState([])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    dataStore.init()
    loadOrders()
    initializeDeviceManager()
    
    // Start storage monitoring
    storageMonitor.startMonitoring()
    storageMonitor.onStorageAlert((alert) => {
      console.warn('Storage alert:', alert)
      if (alert.level === 'critical') {
        dataStore.pruneOldData()
      }
    })
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const loadOrders = async () => {
    const storedOrders = await dataStore.getOrders()
    setOrders(storedOrders)
  }

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateCartItem = (id, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id))
    } else {
      setCart(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ))
    }
  }

  const initializeDeviceManager = () => {
    deviceManager.on('deviceDiscovered', (device) => {
      setConnectedDevices(prev => [...prev, device])
    })
    
    deviceManager.on('deviceDisconnected', (device) => {
      setConnectedDevices(prev => prev.filter(d => d.id !== device.id))
    })
    
    deviceManager.startDiscovery()
  }

  const submitOrder = async () => {
    if (cart.length === 0) return
    
    const order = {
      id: Date.now().toString(),
      items: cart,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      timestamp: new Date().toISOString(),
      status: 'pending'
    }
    
    await dataStore.saveOrder(order)
    await printManager.queueReceipt(order)
    
    // Notify connected kitchen displays
    deviceManager.sendOrderUpdate(order.id, 'pending')
    
    setCart([])
    loadOrders()
  }

  const updateOrderStatus = async (orderId, status) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    )
    setOrders(updatedOrders)
    
    // Broadcast status update to connected devices
    deviceManager.sendOrderUpdate(orderId, status)
  }

  useKeyboardShortcuts({
    'ctrl+enter': submitOrder,
    'ctrl+n': () => setCart([]),
    'escape': () => setCart([])
  })

  return (
    <div className="app">
      <header className="app-header">
        <h1>POS System</h1>
        <div className={`status ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '🟢 Online' : '🔴 Offline'}
        </div>
      </header>
      
      <main className="app-main">
        <div className="left-panel">
          <ProductCatalog onAddToCart={addToCart} />
        </div>
        
        <div className="right-panel">
          <Cart 
            items={cart}
            onUpdateItem={updateCartItem}
            onSubmitOrder={submitOrder}
          />
          <LazyOrderQueue orders={orders} />
        </div>
      </main>
    </div>
  )
}
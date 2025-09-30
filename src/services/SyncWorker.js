// Web Worker for background synchronization
self.onmessage = function(e) {
  const { type, data } = e.data

  switch (type) {
    case 'SYNC_ORDERS':
      syncOrders(data)
      break
    case 'SYNC_INVENTORY':
      syncInventory(data)
      break
    default:
      console.log('Unknown message type:', type)
  }
}

async function syncOrders(orders) {
  try {
    // Simulate API calls with delays
    for (const order of orders) {
      await simulateAPICall(`/api/orders`, order)
      
      // Report progress
      self.postMessage({
        type: 'SYNC_PROGRESS',
        data: { orderId: order.id, status: 'synced' }
      })
    }
    
    self.postMessage({
      type: 'SYNC_COMPLETE',
      data: { type: 'orders', count: orders.length }
    })
  } catch (error) {
    self.postMessage({
      type: 'SYNC_ERROR',
      data: { error: error.message }
    })
  }
}

async function syncInventory(inventory) {
  try {
    await simulateAPICall('/api/inventory', inventory)
    
    self.postMessage({
      type: 'SYNC_COMPLETE',
      data: { type: 'inventory' }
    })
  } catch (error) {
    self.postMessage({
      type: 'SYNC_ERROR',
      data: { error: error.message }
    })
  }
}

function simulateAPICall(url, data) {
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        resolve({ success: true })
      } else {
        reject(new Error('Network error'))
      }
    }, 500 + Math.random() * 1000)
  })
}
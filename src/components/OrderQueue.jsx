import React, { useState } from 'react'

export default function OrderQueue({ orders }) {
  const [selectedOrder, setSelectedOrder] = useState(null)

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f39c12',
      preparing: '#3498db',
      ready: '#27ae60',
      completed: '#95a5a6'
    }
    return colors[status] || '#bdc3c7'
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="order-queue">
      <h2>Recent Orders</h2>
      
      {orders.length === 0 ? (
        <p className="no-orders">No orders yet</p>
      ) : (
        <div className="orders-list">
          {orders.slice(0, 10).map(order => (
            <div 
              key={order.id} 
              className="order-item"
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
            >
              <div className="order-header">
                <span className="order-id">#{order.id}</span>
                <span className="order-time">{formatTime(order.timestamp)}</span>
                <span 
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>
              
              <div className="order-summary">
                <span>{order.items.length} items</span>
                <span className="order-total">${order.total.toFixed(2)}</span>
              </div>
              
              {selectedOrder?.id === order.id && (
                <div className="order-details">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item-detail">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .order-queue {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          height: fit-content;
          max-height: 400px;
          overflow-y: auto;
        }

        .order-queue h2 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .no-orders {
          text-align: center;
          color: #7f8c8d;
          padding: 2rem;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .order-item {
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .order-item:hover {
          background: #f8f9fa;
          border-color: #3498db;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .order-id {
          font-weight: bold;
          color: #2c3e50;
        }

        .order-time {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .order-status {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          color: white;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .order-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .order-total {
          font-weight: bold;
          color: #27ae60;
        }

        .order-details {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #eee;
        }

        .order-item-detail {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
          font-size: 0.9rem;
        }

        .order-item-detail:nth-child(odd) {
          background: #f8f9fa;
          margin: 0 -0.5rem;
          padding: 0.25rem 0.5rem;
        }
      `}</style>
    </div>
  )
}
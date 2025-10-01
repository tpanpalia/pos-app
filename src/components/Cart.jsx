import React from 'react'

export default function Cart({ items, onUpdateItem, onSubmitOrder }) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="cart">
      <h2>Cart</h2>
      
      {items.length === 0 ? (
        <p className="empty-cart">Cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>${item.price.toFixed(2)} each</p>
                </div>
                
                <div className="quantity-controls">
                  <button 
                    onClick={() => onUpdateItem(item.id, item.quantity - 1)}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateItem(item.id, item.quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
                
                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-footer">
            <div className="total">
              <strong>Total: ${total.toFixed(2)}</strong>
            </div>
            <button 
              className="submit-btn"
              onClick={onSubmitOrder}
            >
              Submit Order
            </button>
          </div>
        </>
      )}

      <style jsx>{`
        .cart {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          height: fit-content;
        }

        .cart h2 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .empty-cart {
          text-align: center;
          color: #7f8c8d;
          padding: 2rem;
        }

        .cart-items {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 1rem;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .item-info {
          flex: 1;
        }

        .item-info h4 {
          margin: 0;
          color: #2c3e50;
        }

        .item-info p {
          margin: 0.25rem 0 0 0;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .qty-btn {
          width: 30px;
          height: 30px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .qty-btn:hover {
          background: #f5f5f5;
        }

        .quantity {
          min-width: 30px;
          text-align: center;
          font-weight: bold;
        }

        .item-total {
          font-weight: bold;
          color: #27ae60;
          min-width: 80px;
          text-align: right;
        }

        .cart-footer {
          border-top: 2px solid #eee;
          padding-top: 1rem;
        }

        .total {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          text-align: right;
          color: #2c3e50;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
          background: #27ae60;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:hover {
          background: #229954;
        }

        .submit-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
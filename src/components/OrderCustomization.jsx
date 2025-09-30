import React, { useState } from 'react'

export default function OrderCustomization({ product, onCustomize, onCancel }) {
  const [size, setSize] = useState('regular')
  const [addOns, setAddOns] = useState([])
  const [specialRequests, setSpecialRequests] = useState('')

  const sizes = [
    { id: 'small', name: 'Small', price: -1.00 },
    { id: 'regular', name: 'Regular', price: 0 },
    { id: 'large', name: 'Large', price: 2.00 }
  ]

  const availableAddOns = [
    { id: 'cheese', name: 'Extra Cheese', price: 1.50 },
    { id: 'bacon', name: 'Bacon', price: 2.00 },
    { id: 'sauce', name: 'Extra Sauce', price: 0.50 }
  ]

  const toggleAddOn = (addOn) => {
    setAddOns(prev => 
      prev.find(a => a.id === addOn.id)
        ? prev.filter(a => a.id !== addOn.id)
        : [...prev, addOn]
    )
  }

  const calculatePrice = () => {
    const sizePrice = sizes.find(s => s.id === size)?.price || 0
    const addOnPrice = addOns.reduce((sum, addOn) => sum + addOn.price, 0)
    return product.price + sizePrice + addOnPrice
  }

  const handleSubmit = () => {
    const customizedProduct = {
      ...product,
      price: calculatePrice(),
      customizations: {
        size,
        addOns,
        specialRequests: specialRequests.trim()
      }
    }
    onCustomize(customizedProduct)
  }

  return (
    <div className="customization-modal">
      <div className="modal-content">
        <h3>Customize {product.name}</h3>
        
        <div className="size-section">
          <h4>Size</h4>
          {sizes.map(s => (
            <label key={s.id} className="option">
              <input
                type="radio"
                value={s.id}
                checked={size === s.id}
                onChange={(e) => setSize(e.target.value)}
              />
              {s.name} {s.price !== 0 && `(${s.price > 0 ? '+' : ''}$${s.price.toFixed(2)})`}
            </label>
          ))}
        </div>

        <div className="addons-section">
          <h4>Add-ons</h4>
          {availableAddOns.map(addOn => (
            <label key={addOn.id} className="option">
              <input
                type="checkbox"
                checked={addOns.find(a => a.id === addOn.id)}
                onChange={() => toggleAddOn(addOn)}
              />
              {addOn.name} (+${addOn.price.toFixed(2)})
            </label>
          ))}
        </div>

        <div className="special-requests">
          <h4>Special Requests</h4>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any special instructions..."
            rows="3"
          />
        </div>

        <div className="modal-footer">
          <div className="price">Total: ${calculatePrice().toFixed(2)}</div>
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
          <button onClick={handleSubmit} className="add-btn">Add to Cart</button>
        </div>
      </div>

      <style jsx>{`
        .customization-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          max-width: 400px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          margin: 0 0 1.5rem 0;
          color: #2c3e50;
        }

        .size-section, .addons-section, .special-requests {
          margin-bottom: 1.5rem;
        }

        .size-section h4, .addons-section h4, .special-requests h4 {
          margin: 0 0 0.5rem 0;
          color: #34495e;
        }

        .option {
          display: block;
          margin-bottom: 0.5rem;
          cursor: pointer;
        }

        .option input {
          margin-right: 0.5rem;
        }

        textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .price {
          font-size: 1.25rem;
          font-weight: bold;
          color: #27ae60;
        }

        .cancel-btn, .add-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .cancel-btn {
          background: #95a5a6;
          color: white;
        }

        .add-btn {
          background: #3498db;
          color: white;
        }
      `}</style>
    </div>
  )
}
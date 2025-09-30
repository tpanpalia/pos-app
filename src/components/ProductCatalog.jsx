import React, { useState, useEffect, useMemo } from 'react'
import { OfflineDataStore } from '../services/OfflineDataStore'
import OrderCustomization from './OrderCustomization'
import VirtualScrollList from './VirtualScrollList'
import { useDebounce } from '../hooks/useDebounce'

const dataStore = new OfflineDataStore()

export default function ProductCatalog({ onAddToCart }) {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [customizingProduct, setCustomizingProduct] = useState(null)
  const [useVirtualScroll, setUseVirtualScroll] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const productList = await dataStore.getProducts()
      setProducts(productList)
      setUseVirtualScroll(productList.length > 50)
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))]
    return cats
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, debouncedSearchTerm, selectedCategory])

  return (
    <div className="product-catalog">
      <div className="catalog-header">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {useVirtualScroll ? (
        <VirtualScrollList
          items={filteredProducts}
          itemHeight={120}
          containerHeight={500}
          renderItem={(product) => (
            <div className="product-card">
              <h3>{product.name}</h3>
              <p className="price">${product.price.toFixed(2)}</p>
              <p className="category">{product.category}</p>
              <div className="product-actions">
                <button 
                  className="customize-btn"
                  onClick={() => setCustomizingProduct(product)}
                >
                  Customize
                </button>
                <button 
                  className="add-btn"
                  onClick={() => onAddToCart(product)}
                >
                  Quick Add
                </button>
              </div>
            </div>
          )}
        />
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p className="price">${product.price.toFixed(2)}</p>
              <p className="category">{product.category}</p>
              <div className="product-actions">
                <button 
                  className="customize-btn"
                  onClick={() => setCustomizingProduct(product)}
                >
                  Customize
                </button>
                <button 
                  className="add-btn"
                  onClick={() => onAddToCart(product)}
                >
                  Quick Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {customizingProduct && (
        <OrderCustomization
          product={customizingProduct}
          onCustomize={(customizedProduct) => {
            onAddToCart(customizedProduct)
            setCustomizingProduct(null)
          }}
          onCancel={() => setCustomizingProduct(null)}
        />
      )}

      <style jsx>{`
        .product-catalog {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .catalog-header {
          margin-bottom: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .category-filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .category-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-btn:hover {
          background: #f5f5f5;
        }

        .category-btn.active {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          overflow-y: auto;
          flex: 1;
        }

        .product-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          background: white;
          transition: transform 0.2s;
        }

        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .product-card h3 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
        }

        .price {
          font-size: 1.25rem;
          font-weight: bold;
          color: #27ae60;
          margin: 0.5rem 0;
        }

        .category {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }

        .product-actions {
          display: flex;
          gap: 0.5rem;
        }

        .customize-btn, .add-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.2s;
        }

        .customize-btn {
          background: #f39c12;
          color: white;
        }

        .customize-btn:hover {
          background: #e67e22;
        }

        .add-btn {
          background: #3498db;
          color: white;
        }

        .add-btn:hover {
          background: #2980b9;
        }

        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      `}</style>
    </div>
  )
}
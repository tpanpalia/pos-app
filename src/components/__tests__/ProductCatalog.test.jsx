import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProductCatalog from '../ProductCatalog'

// Mock the OfflineDataStore
vi.mock('../services/OfflineDataStore', () => ({
  OfflineDataStore: vi.fn(() => ({
    getProducts: vi.fn(() => Promise.resolve([
      { id: '1', name: 'Burger', price: 12.99, category: 'Main' },
      { id: '2', name: 'Fries', price: 4.99, category: 'Sides' },
      { id: '3', name: 'Soda', price: 2.99, category: 'Drinks' }
    ]))
  }))
}))

vi.mock('../hooks/useDebounce', () => ({
  useDebounce: (value) => value
}))

describe('ProductCatalog Component', () => {
  const mockOnAddToCart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders products after loading', async () => {
    render(<ProductCatalog onAddToCart={mockOnAddToCart} />)
    
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument()
      expect(screen.getByText('Fries')).toBeInTheDocument()
      expect(screen.getByText('Soda')).toBeInTheDocument()
    })
  })

  test('filters products by search term', async () => {
    render(<ProductCatalog onAddToCart={mockOnAddToCart} />)
    
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search products...')
    fireEvent.change(searchInput, { target: { value: 'burger' } })

    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument()
      expect(screen.queryByText('Fries')).not.toBeInTheDocument()
    })
  })

  test('filters products by category', async () => {
    render(<ProductCatalog onAddToCart={mockOnAddToCart} />)
    
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument()
    })

    const sidesButton = screen.getByRole('button', { name: 'Sides' })
    fireEvent.click(sidesButton)

    await waitFor(() => {
      expect(screen.getByText('Fries')).toBeInTheDocument()
      expect(screen.queryByText('Burger')).not.toBeInTheDocument()
    })
  })

  test('adds product to cart on quick add', async () => {
    render(<ProductCatalog onAddToCart={mockOnAddToCart} />)
    
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument()
    })

    const quickAddButtons = screen.getAllByText('Quick Add')
    fireEvent.click(quickAddButtons[0])

    expect(mockOnAddToCart).toHaveBeenCalledWith({
      id: '1',
      name: 'Burger',
      price: 12.99,
      category: 'Main'
    })
  })

  test('opens customization modal', async () => {
    render(<ProductCatalog onAddToCart={mockOnAddToCart} />)
    
    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument()
    })

    const customizeButtons = screen.getAllByText('Customize')
    fireEvent.click(customizeButtons[0])

    expect(screen.getByText('Customize Burger')).toBeInTheDocument()
  })
})
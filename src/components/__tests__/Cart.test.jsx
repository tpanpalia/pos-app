import { render, screen, fireEvent } from '@testing-library/react'
import Cart from '../Cart'

describe('Cart Component', () => {
  const mockItems = [
    { id: '1', name: 'Burger', price: 12.99, quantity: 2 },
    { id: '2', name: 'Fries', price: 4.99, quantity: 1 }
  ]

  const mockProps = {
    items: mockItems,
    onUpdateItem: vi.fn(),
    onSubmitOrder: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders cart items correctly', () => {
    render(<Cart {...mockProps} />)
    
    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.getByText('Fries')).toBeInTheDocument()
    expect(screen.getByText('$12.99 each')).toBeInTheDocument()
    expect(screen.getByText('$4.99 each')).toBeInTheDocument()
  })

  test('calculates total correctly', () => {
    render(<Cart {...mockProps} />)
    
    // (12.99 * 2) + (4.99 * 1) = 30.97
    expect(screen.getByText('Total: $30.97')).toBeInTheDocument()
  })

  test('handles quantity updates', () => {
    render(<Cart {...mockProps} />)
    
    const increaseButtons = screen.getAllByText('+')
    fireEvent.click(increaseButtons[0])
    
    expect(mockProps.onUpdateItem).toHaveBeenCalledWith('1', 3)
  })

  test('handles item removal when quantity reaches 0', () => {
    render(<Cart {...mockProps} />)
    
    const decreaseButtons = screen.getAllByText('-')
    fireEvent.click(decreaseButtons[1]) // Decrease fries quantity to 0
    
    expect(mockProps.onUpdateItem).toHaveBeenCalledWith('2', 0)
  })

  test('submits order when button clicked', () => {
    render(<Cart {...mockProps} />)
    
    const submitButton = screen.getByText('Submit Order')
    fireEvent.click(submitButton)
    
    expect(mockProps.onSubmitOrder).toHaveBeenCalled()
  })

  test('shows empty cart message when no items', () => {
    render(<Cart {...mockProps} items={[]} />)
    
    expect(screen.getByText('Cart is empty')).toBeInTheDocument()
  })
})
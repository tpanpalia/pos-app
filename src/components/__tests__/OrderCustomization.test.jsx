import { render, screen, fireEvent } from '@testing-library/react'
import OrderCustomization from '../OrderCustomization'

describe('OrderCustomization', () => {
  const mockProduct = {
    id: '1',
    name: 'Burger',
    price: 12.99
  }

  const mockProps = {
    product: mockProduct,
    onCustomize: vi.fn(),
    onCancel: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders customization options', () => {
    render(<OrderCustomization {...mockProps} />)
    
    expect(screen.getByText('Customize Burger')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
    expect(screen.getByText('Add-ons')).toBeInTheDocument()
    expect(screen.getByText('Special Requests')).toBeInTheDocument()
  })

  test('calculates price with size change', () => {
    render(<OrderCustomization {...mockProps} />)
    
    fireEvent.click(screen.getByLabelText(/Large/))
    
    expect(screen.getByText('Total: $14.99')).toBeInTheDocument()
  })

  test('calculates price with add-ons', () => {
    render(<OrderCustomization {...mockProps} />)
    
    fireEvent.click(screen.getByLabelText(/Extra Cheese/))
    
    expect(screen.getByText('Total: $14.49')).toBeInTheDocument()
  })

  test('handles special requests', () => {
    render(<OrderCustomization {...mockProps} />)
    
    const textarea = screen.getByPlaceholderText('Any special instructions...')
    fireEvent.change(textarea, { target: { value: 'No onions' } })
    
    expect(textarea.value).toBe('No onions')
  })

  test('calls onCustomize with correct data', () => {
    render(<OrderCustomization {...mockProps} />)
    
    fireEvent.click(screen.getByLabelText(/Large/))
    fireEvent.click(screen.getByLabelText(/Extra Cheese/))
    fireEvent.click(screen.getByText('Add to Cart'))
    
    expect(mockProps.onCustomize).toHaveBeenCalledWith(
      expect.objectContaining({
        ...mockProduct,
        price: expect.any(Number),
        customizations: {
          size: 'large',
          addOns: [{ id: 'cheese', name: 'Extra Cheese', price: 1.50 }],
          specialRequests: ''
        }
      })
    )
  })

  test('calls onCancel when cancel clicked', () => {
    render(<OrderCustomization {...mockProps} />)
    
    fireEvent.click(screen.getByText('Cancel'))
    
    expect(mockProps.onCancel).toHaveBeenCalled()
  })
})
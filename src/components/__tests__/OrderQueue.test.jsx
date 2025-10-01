import { render, screen, fireEvent } from '@testing-library/react'
import OrderQueue from '../OrderQueue'

describe('OrderQueue', () => {
  const mockOrders = [
    {
      id: '1',
      items: [{ name: 'Burger', quantity: 2, price: 12.99 }],
      total: 25.98,
      status: 'pending',
      timestamp: '2023-01-01T12:00:00Z'
    },
    {
      id: '2',
      items: [{ name: 'Fries', quantity: 1, price: 4.99 }],
      total: 4.99,
      status: 'ready',
      timestamp: '2023-01-01T12:30:00Z'
    }
  ]

  test('renders orders correctly', () => {
    render(<OrderQueue orders={mockOrders} />)
    
    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText('ready')).toBeInTheDocument()
  })

  test('shows empty state', () => {
    render(<OrderQueue orders={[]} />)
    
    expect(screen.getByText('No orders yet')).toBeInTheDocument()
  })

  test('expands order details on click', () => {
    render(<OrderQueue orders={mockOrders} />)
    
    fireEvent.click(screen.getByText('#1'))
    
    expect(screen.getByText('2x Burger')).toBeInTheDocument()
    expect(screen.getAllByText('$25.98')).toHaveLength(2) // Summary and detail
  })

  test('collapses expanded order on second click', () => {
    render(<OrderQueue orders={mockOrders} />)
    
    fireEvent.click(screen.getByText('#1'))
    fireEvent.click(screen.getByText('#1'))
    
    expect(screen.queryByText('2x Burger')).not.toBeInTheDocument()
  })
})
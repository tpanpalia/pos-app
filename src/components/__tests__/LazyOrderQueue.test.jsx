import { render, screen } from '@testing-library/react'
import LazyOrderQueue from '../LazyOrderQueue'

// Mock the lazy-loaded component
vi.mock('../OrderQueue', () => ({
  __esModule: true,
  default: ({ orders }) => <div data-testid="order-queue">Orders: {orders.length}</div>
}))

describe('LazyOrderQueue', () => {
  test('shows loading state initially', () => {
    render(<LazyOrderQueue orders={[]} />)
    
    expect(screen.getByText('Loading orders...')).toBeInTheDocument()
  })

  test('renders OrderQueue after loading', async () => {
    render(<LazyOrderQueue orders={[{ id: '1' }]} />)
    
    expect(await screen.findByTestId('order-queue')).toBeInTheDocument()
    expect(screen.getByText('Orders: 1')).toBeInTheDocument()
  })
})
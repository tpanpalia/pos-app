import { render, screen, fireEvent } from '@testing-library/react'
import VirtualScrollList from '../VirtualScrollList'

describe('VirtualScrollList', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }))
  const mockRenderItem = (item) => <div key={item.id}>{item.name}</div>

  test('renders visible items only', () => {
    render(
      <VirtualScrollList
        items={mockItems}
        itemHeight={50}
        containerHeight={200}
        renderItem={mockRenderItem}
      />
    )
    
    // Should render ~6 items (200/50 + 2 buffer)
    expect(screen.getByText('Item 0')).toBeInTheDocument()
    expect(screen.getByText('Item 5')).toBeInTheDocument()
    expect(screen.queryByText('Item 10')).not.toBeInTheDocument()
  })

  test('updates visible items on scroll', () => {
    const { container } = render(
      <VirtualScrollList
        items={mockItems}
        itemHeight={50}
        containerHeight={200}
        renderItem={mockRenderItem}
      />
    )
    
    const scrollContainer = container.firstChild
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 250 } })
    
    // Should now show items starting from index 5
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument()
    expect(screen.getByText('Item 5')).toBeInTheDocument()
  })

  test('handles empty items array', () => {
    render(
      <VirtualScrollList
        items={[]}
        itemHeight={50}
        containerHeight={200}
        renderItem={mockRenderItem}
      />
    )
    
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument()
  })
})
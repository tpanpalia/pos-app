import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '../useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  let mockCallback

  beforeEach(() => {
    mockCallback = vi.fn()
  })

  test('registers keyboard event listener', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    
    renderHook(() => useKeyboardShortcuts({ 'ctrl+enter': mockCallback }))
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    
    addEventListenerSpy.mockRestore()
  })

  test('calls callback for matching shortcut', () => {
    renderHook(() => useKeyboardShortcuts({ 'ctrl+enter': mockCallback }))
    
    const event = new KeyboardEvent('keydown', {
      key: 'enter',
      ctrlKey: true
    })
    
    document.dispatchEvent(event)
    
    expect(mockCallback).toHaveBeenCalled()
  })

  test('prevents default for matching shortcuts', () => {
    renderHook(() => useKeyboardShortcuts({ 'ctrl+s': mockCallback }))
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true
    })
    
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
    document.dispatchEvent(event)
    
    expect(preventDefaultSpy).toHaveBeenCalled()
  })

  test('handles multiple modifier keys', () => {
    renderHook(() => useKeyboardShortcuts({ 'ctrl+shift+s': mockCallback }))
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      shiftKey: true
    })
    
    document.dispatchEvent(event)
    
    expect(mockCallback).toHaveBeenCalled()
  })

  test('ignores non-matching shortcuts', () => {
    renderHook(() => useKeyboardShortcuts({ 'ctrl+enter': mockCallback }))
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true
    })
    
    document.dispatchEvent(event)
    
    expect(mockCallback).not.toHaveBeenCalled()
  })

  test('removes event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    
    const { unmount } = renderHook(() => useKeyboardShortcuts({ 'ctrl+enter': mockCallback }))
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    
    removeEventListenerSpy.mockRestore()
  })

  test('handles escape key', () => {
    renderHook(() => useKeyboardShortcuts({ 'escape': mockCallback }))
    
    const event = new KeyboardEvent('keydown', { key: 'escape' })
    document.dispatchEvent(event)
    
    expect(mockCallback).toHaveBeenCalled()
  })
})
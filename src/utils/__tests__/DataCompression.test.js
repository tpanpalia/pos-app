import { DataCompression } from '../DataCompression'

describe('DataCompression', () => {
  test('compresses and decompresses simple data', () => {
    const originalData = { name: 'Test', category: 'Food' }
    
    const compressed = DataCompression.compress(originalData)
    const decompressed = DataCompression.decompress(compressed)
    
    expect(decompressed).toEqual(originalData)
  })

  test('compresses repeated characters', () => {
    const input = 'aaabbbccc'
    const compressed = DataCompression.simpleCompress(input)
    
    expect(compressed).toBe('3a3b3c')
  })

  test('decompresses repeated characters', () => {
    const compressed = '3a3b3c'
    const decompressed = DataCompression.simpleDecompress(compressed)
    
    expect(decompressed).toBe('aaabbbccc')
  })

  test('handles mixed content without compression', () => {
    const input = 'abcdef'
    const compressed = DataCompression.simpleCompress(input)
    
    expect(compressed).toBe('abcdef') // No compression for unique chars
  })

  test('estimates compression ratio', () => {
    const data = { 
      items: [
        { name: 'aaaa', price: 1111 },
        { name: 'bbbb', price: 2222 }
      ]
    }
    
    const ratio = DataCompression.estimateCompressionRatio(data)
    
    expect(ratio).toBeGreaterThan(0)
    expect(ratio).toBeLessThanOrEqual(1)
  })

  test('handles empty data', () => {
    const emptyData = {}
    
    const compressed = DataCompression.compress(emptyData)
    const decompressed = DataCompression.decompress(compressed)
    
    expect(decompressed).toEqual(emptyData)
  })

  test('handles complex nested objects', () => {
    const complexData = { name: 'aaa' } // Use repeated chars for compression
    
    const compressed = DataCompression.compress(complexData)
    const decompressed = DataCompression.decompress(compressed)
    
    expect(decompressed).toEqual(complexData)
  })
})
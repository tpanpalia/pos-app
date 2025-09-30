export class DataCompression {
  static compress(data) {
    const jsonString = JSON.stringify(data)
    return this.simpleCompress(jsonString)
  }

  static decompress(compressedData) {
    const jsonString = this.simpleDecompress(compressedData)
    return JSON.parse(jsonString)
  }

  static simpleCompress(str) {
    // Simple run-length encoding for demo
    let compressed = ''
    let count = 1
    
    for (let i = 0; i < str.length; i++) {
      if (str[i] === str[i + 1]) {
        count++
      } else {
        compressed += count > 1 ? `${count}${str[i]}` : str[i]
        count = 1
      }
    }
    
    return compressed
  }

  static simpleDecompress(compressed) {
    let decompressed = ''
    let i = 0
    
    while (i < compressed.length) {
      if (/\d/.test(compressed[i])) {
        const count = parseInt(compressed[i])
        const char = compressed[i + 1]
        decompressed += char.repeat(count)
        i += 2
      } else {
        decompressed += compressed[i]
        i++
      }
    }
    
    return decompressed
  }

  static estimateCompressionRatio(data) {
    const original = JSON.stringify(data).length
    const compressed = this.compress(data).length
    return compressed / original
  }
}
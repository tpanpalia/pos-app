export class PrintJobManager {
  constructor() {
    this.printQueue = []
    this.isProcessing = false
    this.retryAttempts = new Map()
    this.maxRetries = 3
  }

  async queueReceipt(order) {
    const printJob = {
      id: `receipt-${order.id}`,
      type: 'receipt',
      data: order,
      priority: 1,
      timestamp: Date.now()
    }
    
    this.printQueue.push(printJob)
    this.printQueue.sort((a, b) => b.priority - a.priority)
    
    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  async queueKitchenOrder(order) {
    const printJob = {
      id: `kitchen-${order.id}`,
      type: 'kitchen',
      data: order,
      priority: 3,
      timestamp: Date.now()
    }
    
    this.printQueue.push(printJob)
    this.printQueue.sort((a, b) => b.priority - a.priority)
    
    if (!this.isProcessing) {
      this.processQueue()
    }
  }

  async processQueue() {
    if (this.isProcessing || this.printQueue.length === 0) return
    
    this.isProcessing = true
    
    while (this.printQueue.length > 0) {
      const job = this.printQueue.shift()
      
      try {
        await this.printJob(job)
        this.retryAttempts.delete(job.id)
      } catch (error) {
        const attempts = this.retryAttempts.get(job.id) || 0
        
        if (attempts < this.maxRetries) {
          this.retryAttempts.set(job.id, attempts + 1)
          // Re-queue with lower priority
          job.priority = Math.max(0, job.priority - 1)
          this.printQueue.push(job)
          this.printQueue.sort((a, b) => b.priority - a.priority)
        } else {
          console.error(`Print job ${job.id} failed after ${this.maxRetries} attempts`)
          this.notifyPrintFailure(job)
        }
      }
      
      // Small delay between print jobs
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    this.isProcessing = false
  }

  async printJob(job) {
    console.log(`Printing ${job.type} for order ${job.data.id}`)
    
    const template = this.getTemplate(job.type)
    const content = this.formatContent(template, job.data)
    
    // Simulate print operation
    await this.sendToPrinter(content)
  }

  getTemplate(type) {
    const templates = {
      receipt: {
        header: '================================\n          RECEIPT\n================================\n',
        itemFormat: '{name} x{quantity} ........... ${total}\n',
        footer: '================================\nTotal: ${orderTotal}\nThank you!\n================================\n'
      },
      kitchen: {
        header: '*** KITCHEN ORDER ***\nOrder #{orderId}\n{timestamp}\n\n',
        itemFormat: '{quantity}x {name}\n{customizations}\n\n',
        footer: '*** END ORDER ***\n'
      }
    }
    
    return templates[type] || templates.receipt
  }

  formatContent(template, order) {
    let content = template.header
      .replace('{orderId}', order.id)
      .replace('{timestamp}', new Date(order.timestamp).toLocaleString())
    
    order.items.forEach(item => {
      const itemContent = template.itemFormat
        .replace('{name}', item.name)
        .replace('{quantity}', item.quantity)
        .replace('{total}', (item.price * item.quantity).toFixed(2))
        .replace('{customizations}', item.customizations || '')
      
      content += itemContent
    })
    
    content += template.footer
      .replace('{orderTotal}', order.total.toFixed(2))
    
    return content
  }

  async sendToPrinter(content) {
    // Simulate ESC/POS commands
    const escPos = this.generateESCPOS(content)
    
    // In real implementation, this would send to thermal printer
    console.log('ESC/POS Commands:', escPos)
    
    // Simulate print delay
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  generateESCPOS(content) {
    // Basic ESC/POS command generation
    const ESC = '\x1B'
    const commands = []
    
    // Initialize printer
    commands.push(ESC + '@')
    
    // Set font and alignment
    commands.push(ESC + 'a' + '\x01') // Center align
    
    // Add content
    commands.push(content)
    
    // Cut paper
    commands.push(ESC + 'd' + '\x03') // Feed 3 lines
    commands.push('\x1D' + 'V' + '\x42' + '\x00') // Partial cut
    
    return commands.join('')
  }

  notifyPrintFailure(job) {
    // In real app, show user notification
    console.error(`Failed to print ${job.type} for order ${job.data.id}`)
    
    // Could dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('printFailure', {
      detail: { job }
    }))
  }

  getQueueStatus() {
    return {
      pending: this.printQueue.length,
      processing: this.isProcessing,
      failed: Array.from(this.retryAttempts.entries())
        .filter(([, attempts]) => attempts >= this.maxRetries)
        .length
    }
  }
}
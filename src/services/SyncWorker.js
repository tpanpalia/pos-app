export class SyncWorker {
  constructor() {
    this.worker = null
    this.isRunning = false
    this.onMessage = null
  }

  start(scriptURL) {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(scriptURL)
      this.isRunning = true
      
      this.worker.onmessage = (e) => {
        if (this.onMessage) {
          this.onMessage(e.data)
        }
      }
      
      this.worker.onerror = (error) => {
        console.error('Sync worker error:', error)
      }
    }
  }

  postMessage(message) {
    if (this.worker) {
      this.worker.postMessage(message)
    } else {
      console.warn('Sync worker not started')
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
      this.isRunning = false
    } else {
      console.warn('Sync worker not started')
    }
  }

  queueSync(job) {
    this.postMessage({
      type: 'QUEUE_SYNC',
      job
    })
  }

  getStatus() {
    this.postMessage({ type: 'GET_STATUS' })
  }
}
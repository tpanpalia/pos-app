export default class PrintJobManager {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  addJob(destination, content) {
    const job = { destination, content, status: "queued" };
    this.queue.push(job);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      try {
        await this.sendToPrinter(job);
        job.status = "done";
        console.log(`Printed to ${job.destination}:`, job.content);
      } catch (err) {
        job.status = "error";
        console.error("Print failed, re-queueing", err);
        this.queue.push(job);
        await this.sleep(1000);
      }
    }

    this.isProcessing = false;
  }

  async sendToPrinter(job) {
    return new Promise(resolve => {
      console.log(`[Printer] ${job.destination} → ${job.content}`);
      resolve();
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

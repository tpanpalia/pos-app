export default class OfflineDataStore {
  constructor(dbName = "posDB") {
    this.dbName = dbName;
    this.db = null;
    this.queue = []; // Queue for offline operations
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("products")) {
          db.createObjectStore("products", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("orders")) {
          db.createObjectStore("orders", { autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => reject(event.target.error);
    });
  }

  // Put data in a transaction
  async put(storeName, data) {
    if (!navigator.onLine) {
      this.queue.push({ storeName, data });
      return;
    }

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);

      tx.oncomplete = () => resolve(data); // commit success
      tx.onerror = () => {
        console.error("Transaction failed, rollback occurred");
        reject(tx.error); // IndexedDB automatically rolls back failed transactions
      };
      tx.onabort = () => {
        console.warn("Transaction aborted, rollback triggered");
        reject(tx.error);
      };

      store.put(data);
    });
  }

  // Get all records from a store
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // Process queued operations with rollback support
  async processQueue() {
    if (!navigator.onLine || this.queue.length === 0) return;

    const copyQueue = [...this.queue];
    this.queue = []; // clear queue before processing

    for (const job of copyQueue) {
      try {
        await this.put(job.storeName, job.data);
      } catch (err) {
        console.error("Operation failed, re-queueing for retry:", err);
        this.queue.push(job); // keep failed jobs in queue
      }
    }
  }

  // Optional helper: run multiple operations as one transaction
  async runTransaction(storeName, operations = []) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);

      try {
        operations.forEach(op => store.put(op));
      } catch (err) {
        tx.abort(); // rollback all operations in this transaction
      }
    });
  }

  async getUnsyncedOrders() {
    const orders = await this.getAll("orders");
    return orders.filter(o => !o.synced);
  }

  async markAsSynced(localId, serverData) {
    const tx = this.db.transaction("orders", "readwrite");
    const store = tx.objectStore("orders");
    const order = await new Promise((resolve, reject) => {
        const req = store.get(localId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
    });
    if (!order) return;
    order.synced = true;
    order.serverId = serverData.id;
    order.updatedAt = serverData.updatedAt;
    store.put(order);
  }
}

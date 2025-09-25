export default class OfflineDataStore {
  constructor(dbName = "posDB") {
    this.dbName = dbName;
    this.db = null;
    this.queue = [];
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("products")) {
          db.createObjectStore("products", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("orders")) {
          db.createObjectStore("orders", { autoIncrement: true });
        }
      };

      request.onsuccess = event => {
        this.db = event.target.result;
        resolve();
      };
      request.onerror = event => reject(event.target.error);
    });
  }

  async put(storeName, data) {
    if (!navigator.onLine) {
      this.queue.push({ storeName, data });
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.put(data);
      req.onsuccess = () => resolve(data);
      req.onerror = e => reject(e.target.error);
    });
  }

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = e => reject(e.target.error);
    });
  }

  async processQueue() {
    if (!navigator.onLine || this.queue.length === 0) return;
    const copy = [...this.queue];
    this.queue = [];
    for (const job of copy) {
      await this.put(job.storeName, job.data);
    }
  }
}

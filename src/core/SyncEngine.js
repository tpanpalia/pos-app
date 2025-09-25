const API_BASE = "https://api.example.com";

export default class SyncEngine {
  constructor(offlineStore, options = {}) {
    this.offlineStore = offlineStore;
    this.isSyncing = false;
    this.batchSize = options.batchSize || 25;
    this.interval = null;
  }

  startAutoSync(ms = 30000) {
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.syncAll(), ms);
  }

  stopAutoSync() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  // Push unsynced orders and pull products
  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      await this._pushUnsyncedOrders();
      await this._pullProducts();
    } catch (err) {
      console.error("SyncEngine.syncAll error", err);
    } finally {
      this.isSyncing = false;
    }
  }

  // push unsynced orders in batches
  async _pushUnsyncedOrders() {
    if (!this.offlineStore) return;
    const unsynced = await this.offlineStore.getUnsyncedOrders();
    if (!unsynced.length) return;

    for (let i = 0; i < unsynced.length; i += this.batchSize) {
      const batch = unsynced.slice(i, i + this.batchSize);
      // attempt to push batch to API
      try {
        const res = await fetch(`${API_BASE}/orders/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orders: batch }),
        });
        if (!res.ok) throw new Error("Batch push failed");
        const json = await res.json();

        for (const meta of json.results || []) {
          if (meta.localId) {
            await this.offlineStore.markAsSynced(meta.localId, { id: meta.serverId, updatedAt: meta.updatedAt });
          }
        }
      } catch (err) {
        console.error("Push batch failed, will retry later", err);
        break;
      }
    }
  }

  // Pull products from server and merge into local orders/products
  async _pullProducts() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const products = await res.json();
      for (const p of products) {
        // ensure product has id
        if (!p.id) continue;
        await this.offlineStore.put("products", p);
      }
    } catch (err) {
      console.error("Pull products failed", err);
    }
  }

  // call offlineStore.processQueuedWrites with handler to push single job
  async flushWriteQueueToServer() {
    if (!this.offlineStore) return;
    const handler = async (job) => {
      if (job.store === "orders") {
        const payload = { order: job.data, localId: job.data.id };
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Order push failed");
        const json = await res.json();
        return { id: json.id, updatedAt: json.updatedAt };
      }
      throw new Error("Unknown job store: " + job.store);
    };

    await this.offlineStore.processQueuedWrites(handler);
  }
}

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

  async syncAll() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      await this.pushUnsyncedOrders();
      await this.pullProducts();
    } catch (err) {
      console.error("SyncEngine.syncAll error:", err);
    } finally {
      this.isSyncing = false;
    }
  }

  async pushUnsyncedOrders() {
    if (!this.offlineStore) return;
    const unsynced = await this.offlineStore.getUnsyncedOrders?.();
    if (!unsynced?.length) return;

    for (let i = 0; i < unsynced.length; i += this.batchSize) {
      const batch = unsynced.slice(i, i + this.batchSize);
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
            await this.offlineStore.markAsSynced(meta.localId, {
              id: meta.serverId,
              updatedAt: meta.updatedAt,
            });
          }
        }
      } catch (err) {
        console.error("Push batch failed, will retry later:", err);
        break;
      }
    }
  }

  async pullProducts() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const products = await res.json();

      for (const p of products) {
        if (!p.id) continue;
        await this.offlineStore.put("products", p);
      }
    } catch (err) {
      console.error("Pull products failed:", err);
    }
  }
}

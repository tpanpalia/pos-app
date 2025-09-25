import { useEffect, useContext, useState } from "react";
import { StoreContext } from "../context/StoreProvider";
import { Catalog } from "./Catalog";
import { Cart } from "./Cart";
import OfflineDataStore from "../core/OfflineDataStore";
import PrintJobManager from "../core/PrintJobManager";
import SyncEngine from "../core/SyncEngine";

const storeDB = new OfflineDataStore();
const printManager = new PrintJobManager();

export function POSDashboard() {
  const { state, dispatch } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);
  const [syncEngine, setSyncEngine] = useState(null);

  useEffect(() => {
    async function init() {
      await storeDB.init();
      let products = await storeDB.getAll("products");

      if (!products || products.length === 0) {
        products = [
          { id: 1, name: "Coffee", price: 3 },
          { id: 2, name: "Tea", price: 2.5 },
          { id: 3, name: "Sandwich", price: 5 },
          { id: 4, name: "Cake", price: 4 },
          { id: 5, name: "Juice", price: 3.5 },
        ];
        for (const p of products) await storeDB.put("products", p);
      }

      dispatch({ type: "SET_PRODUCTS", payload: products });
      setLoading(false);

      // Initialize SyncEngine
      const engine = new SyncEngine(storeDB, { batchSize: 25 });
      engine.startAutoSync(30000); // sync every 30s
      setSyncEngine(engine);
    }

    init();

    const handleOnline = async () => {
      await storeDB.processQueue();
      syncEngine?.syncAll();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [dispatch]);

    const placeOrder = async () => {
        if (state.cart.length === 0) {
            alert("Cart is empty!");
            return;
        }

        // Prepare order data
        const orderData = {
            items: state.cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                qty: item.qty,
                selectedSize: item.selectedSize || null,
                selectedAddOns: item.selectedAddOns || [],
                specialRequest: item.specialRequest || ""
            })),
            total: state.cart.reduce((sum, i) => sum + i.price * i.qty, 0),
            timestamp: new Date().toISOString(),
            status: "pending", // initial order status
        };

        try {
            // Run atomic transaction to save order
            await storeDB.runTransaction("orders", [orderData]);

            // Update global state only after successful transaction
            dispatch({ type: "PLACE_ORDER" });

            // Prepare receipt content
            const receiptContent = orderData.items
                .map(i => {
                    const sizeText = i.selectedSize ? `, Size: ${i.selectedSize}` : "";
                    const addOnsText = i.selectedAddOns.length > 0 ? `, Add-ons: ${i.selectedAddOns.join(", ")}` : "";
                    const specialText = i.specialRequest ? `, Note: ${i.specialRequest}` : "";
                    return `${i.name} x${i.qty}${sizeText}${addOnsText}${specialText} = $${(i.price * i.qty).toFixed(2)}`;
                })
                .join("\n");

            const totalText = `Total: $${orderData.total.toFixed(2)}`;

            // Queue print job for receipt
            printManager.addJob("receipt", `Receipt:\n${receiptContent}\n${totalText}`);

            alert("Order placed successfully! Receipt queued for printing.");
        } catch (err) {
            console.error("Order placement failed:", err);
            alert("Failed to place order. Please try again.");
        }
    };


  if (loading) return <div>Loading products...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>POS Dashboard</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <Catalog />
        <Cart placeOrder={placeOrder} />
      </div>
    </div>
  );
}

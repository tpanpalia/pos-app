import { useEffect, useContext, useState } from "react";
import { StoreContext } from "../context/StoreProvider";
import { Catalog } from "./Catalog";
import { Cart } from "./Cart";
import OfflineDataStore from "../core/OfflineDataStore";
import PrintJobManager from "../core/PrintJobManager";

const storeDB = new OfflineDataStore();
const printManager = new PrintJobManager();

export function POSDashboard() {
  const { state, dispatch } = useContext(StoreContext);
  const [loading, setLoading] = useState(true);

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
    }

    init();

    const handleOnline = async () => {
      await storeDB.processQueue();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [dispatch]);

  const placeOrder = async () => {
    if (state.cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const orderData = {
      items: state.cart,
      total: state.cart.reduce((sum, i) => sum + i.price * i.qty, 0),
      timestamp: new Date().toISOString(),
    };

    await storeDB.put("orders", orderData);
    dispatch({ type: "PLACE_ORDER" });

    const receiptContent = state.cart
      .map(i => `${i.name} x${i.qty} = $${(i.price * i.qty).toFixed(2)}`)
      .join("\n");
    const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2);
    printManager.addJob("receipt", `Receipt:\n${receiptContent}\nTotal: $${total}`);

    alert("Order placed and print job queued!");
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

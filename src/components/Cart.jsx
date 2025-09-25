import { useContext } from "react";
import { StoreContext } from "../context/StoreProvider";

export function Cart({ placeOrder }) {
  const { state, dispatch } = useContext(StoreContext);

  const updateQty = (id, delta) => {
    const item = state.cart.find(i => i.id === id);
    if (!item) return;

    const newQty = item.qty + delta;
    if (newQty <= 0) {
      dispatch({ type: "REMOVE_FROM_CART", payload: { id } });
    } else {
      dispatch({ type: "ADD_TO_CART", payload: { ...item, qty: delta } });
    }
  };

  const total = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div>
      <h2>Cart</h2>
      {state.cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {state.cart.map(item => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: "5px",
                padding: "10px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 100px" }}>{item.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <button
                  onClick={() => updateQty(item.id, -1)}
                  style={{
                    padding: "5px 10px",
                    border: "none",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  -
                </button>
                <span>{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, 1)}
                  style={{
                    padding: "5px 10px",
                    border: "none",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
              <div style={{ flex: "0 0 60px", textAlign: "right" }}>
                ${(item.price * item.qty).toFixed(2)}
              </div>
              <button
                onClick={() =>
                  dispatch({ type: "REMOVE_FROM_CART", payload: { id: item.id } })
                }
                style={{
                  padding: "5px 10px",
                  border: "none",
                  backgroundColor: "#ffc107",
                  color: "#000",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", alignItems: "center" }}>
            <h3>Total: ${total.toFixed(2)}</h3>
            <button
              onClick={placeOrder}
              style={{
                padding: "10px 20px",
                border: "none",
                backgroundColor: "#007bff",
                color: "#fff",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

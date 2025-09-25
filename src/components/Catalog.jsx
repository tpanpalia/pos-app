import { useContext, useState } from "react";
import { StoreContext } from "../context/StoreProvider";

export function Catalog() {
  const { state, dispatch } = useContext(StoreContext);
  const [search, setSearch] = useState("");

  const filteredProducts = state.products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = product => {
    dispatch({ type: "ADD_TO_CART", payload: { ...product, qty: 1 } });
  };

  return (
    <div>
      <h2>Catalog</h2>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: "5px", width: "200px", marginBottom: "10px" }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {filteredProducts.map(product => (
          <div
            key={product.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "10px",
              width: "150px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            <h4>{product.name}</h4>
            <p>${product.price.toFixed(2)}</p>
            <button
              onClick={() => addToCart(product)}
              style={{
                padding: "5px 10px",
                border: "none",
                backgroundColor: "#007bff",
                color: "#fff",
                cursor: "pointer",
                borderRadius: "3px",
                marginTop: "5px"
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
        {filteredProducts.length === 0 && <p>No products found.</p>}
      </div>
    </div>
  );
}

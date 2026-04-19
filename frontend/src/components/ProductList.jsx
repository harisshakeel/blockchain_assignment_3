import React, { useState, useEffect, useCallback } from "react";
import { ROLES, STATUSES, STATUS_COLORS } from "../utils/contract";

export default function ProductList({ contract }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const fetchProducts = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    setError("");
    try {
      const count = Number(await contract.productCount());
      const list  = [];
      for (let i = 1; i <= count; i++) {
        const p = await contract.getProduct(i);
        list.push({
          id:           Number(p.id),
          name:         p.name,
          description:  p.description,
          currentOwner: p.currentOwner,
          status:       Number(p.status),
        });
      }
      setProducts(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div className="section">
      <div className="section-header">
        <h2>Product Dashboard</h2>
        <button className="btn btn-secondary" onClick={fetchProducts} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {products.length === 0 && !loading ? (
        <p className="empty-msg">No products registered yet.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <div className="product-card-header">
                <span className="product-id">#{p.id}</span>
                <span
                  className="status-badge"
                  style={{ background: STATUS_COLORS[p.status] }}
                >
                  {STATUSES[p.status]}
                </span>
              </div>
              <h3 className="product-name">{p.name}</h3>
              <p className="product-desc">{p.description}</p>
              <div className="product-owner">
                <span className="label">Owner:</span>
                <span className="address" title={p.currentOwner}>
                  {p.currentOwner.slice(0, 8)}…{p.currentOwner.slice(-6)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

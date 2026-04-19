import React, { useState } from "react";
import { STATUSES, STATUS_COLORS } from "../utils/contract";

export default function ProductHistory({ contract }) {
  const [productId, setProductId] = useState("");
  const [history,   setHistory]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleFetch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setHistory(null);
    try {
      const entries = await contract.getProductHistory(BigInt(productId));
      setHistory(
        entries.map((h) => ({
          from:      h.from,
          to:        h.to,
          status:    Number(h.status),
          timestamp: Number(h.timestamp),
          action:    h.action,
        }))
      );
    } catch (err) {
      setError(err.reason ?? err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(ts) {
    return new Date(ts * 1000).toLocaleString();
  }

  function shortAddr(addr) {
    if (!addr || addr === "0x0000000000000000000000000000000000000000") return "—";
    return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
  }

  return (
    <div className="section">
      <h2>Product Audit Trail</h2>
      <p className="section-sub">Full on-chain history of a product.</p>

      <form className="form-card" onSubmit={handleFetch} style={{ marginBottom: "1.5rem" }}>
        <div className="form-group">
          <label>Product ID</label>
          <input
            type="number"
            min="1"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="e.g. 1"
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Loading…" : "View History"}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {history && (
        history.length === 0 ? (
          <p className="empty-msg">No history found.</p>
        ) : (
          <div className="timeline">
            {history.map((h, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" style={{ background: STATUS_COLORS[h.status] }} />
                <div className="timeline-content">
                  <div className="timeline-action">{h.action}</div>
                  <div className="timeline-meta">
                    <span
                      className="status-badge"
                      style={{ background: STATUS_COLORS[h.status] }}
                    >
                      {STATUSES[h.status]}
                    </span>
                    <span className="timeline-time">{formatDate(h.timestamp)}</span>
                  </div>
                  <div className="timeline-addrs">
                    <span className="label">From:</span>
                    <span className="address" title={h.from}>{shortAddr(h.from)}</span>
                    <span className="label" style={{ marginLeft: "1rem" }}>To:</span>
                    <span className="address" title={h.to}>{shortAddr(h.to)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

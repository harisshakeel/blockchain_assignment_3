import React, { useState } from "react";
import { STATUSES } from "../utils/contract";

export default function TransferOwnership({ contract, account }) {
  const [productId,  setProductId]  = useState("");
  const [newOwner,   setNewOwner]   = useState("");
  const [newStatus,  setNewStatus]  = useState("1");
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const tx = await contract.transferOwnership(
        BigInt(productId),
        newOwner.trim(),
        Number(newStatus)
      );
      await tx.wait();
      setSuccess(`Ownership transferred!  Tx: ${tx.hash}`);
      setProductId("");
      setNewOwner("");
      setNewStatus("1");
    } catch (err) {
      setError(err.reason ?? err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <h2>Transfer Product Ownership</h2>
      <p className="section-sub">You must be the current owner of the product.</p>

      <form className="form-card" onSubmit={handleSubmit}>
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
        <div className="form-group">
          <label>Recipient Address</label>
          <input
            type="text"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            placeholder="0x…"
            required
          />
        </div>
        <div className="form-group">
          <label>New Status</label>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {Object.entries(STATUSES).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Transferring…" : "Transfer Ownership"}
        </button>
      </form>

      {success && <div className="success-msg">{success}</div>}
      {error   && <div className="error-msg">{error}</div>}
    </div>
  );
}

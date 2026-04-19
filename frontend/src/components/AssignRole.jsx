import React, { useState } from "react";
import { ROLES } from "../utils/contract";

const ASSIGNABLE_ROLES = Object.entries(ROLES).filter(([v]) => Number(v) !== 0);

export default function AssignRole({ contract }) {
  const [address, setAddress] = useState("");
  const [role,    setRole]    = useState("2");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const tx = await contract.assignRole(address.trim(), Number(role));
      await tx.wait();
      setSuccess(
        `Role "${ROLES[role]}" assigned to ${address.slice(0, 8)}…  Tx: ${tx.hash}`
      );
      setAddress("");
    } catch (err) {
      setError(err.reason ?? err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <h2>Assign Role</h2>
      <p className="section-sub">Only the contract owner (deployer) can assign roles.</p>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Wallet Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x…"
            required
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ASSIGNABLE_ROLES.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Assigning…" : "Assign Role"}
        </button>
      </form>

      {success && <div className="success-msg">{success}</div>}
      {error   && <div className="error-msg">{error}</div>}
    </div>
  );
}

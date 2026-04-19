import React, { useState } from "react";

export default function RegisterProduct({ contract }) {
  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState("");
  const [error,       setError]       = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const tx = await contract.registerProduct(name.trim(), description.trim());
      const receipt = await tx.wait();

      // Parse ProductRegistered event to get new ID
      const event = receipt.logs
        .map((log) => { try { return contract.interface.parseLog(log); } catch { return null; } })
        .find((e) => e?.name === "ProductRegistered");

      const newId = event ? Number(event.args.productId) : "?";
      setSuccess(`Product registered successfully! ID: #${newId}  |  Tx: ${tx.hash}`);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err.reason ?? err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section">
      <h2>Register New Product</h2>
      <p className="section-sub">Only Manufacturers can register products.</p>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Widget Pro 3000"
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief product description"
            rows={3}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Registering…" : "Register Product"}
        </button>
      </form>

      {success && <div className="success-msg">{success}</div>}
      {error   && <div className="error-msg">{error}</div>}
    </div>
  );
}

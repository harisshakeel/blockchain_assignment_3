import React from "react";
import { ROLES } from "../utils/contract";

export default function Header({ account, userRole, onConnect, loading }) {
  const short = account
    ? `${account.slice(0, 6)}…${account.slice(-4)}`
    : null;

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <span className="header-title">Supply Chain DApp</span>
          <span className="header-author">Muhammad Haris &mdash; 22L-6972</span>
        </div>

        <div className="header-wallet">
          {account ? (
            <div className="wallet-info">
              <span className="role-badge">{ROLES[userRole] ?? "Unknown"}</span>
              <span className="wallet-address" title={account}>{short}</span>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onConnect} disabled={loading}>
              {loading ? "Connecting…" : "Connect MetaMask"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

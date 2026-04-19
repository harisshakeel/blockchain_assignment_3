import React, { useState, useEffect } from "react";
import Header           from "./components/Header.jsx";
import ProductList      from "./components/ProductList.jsx";
import RegisterProduct  from "./components/RegisterProduct.jsx";
import TransferOwnership from "./components/TransferOwnership.jsx";
import ProductHistory   from "./components/ProductHistory.jsx";
import AssignRole       from "./components/AssignRole.jsx";
import { connectWallet, getContract, ROLES } from "./utils/contract";
import "./App.css";

const TABS = [
  { id: "dashboard", label: "Dashboard",           roles: null },
  { id: "register",  label: "Register Product",    roles: [1]      },
  { id: "transfer",  label: "Transfer Ownership",  roles: [1,2,3]  },
  { id: "history",   label: "Audit Trail",         roles: null },
  { id: "assign",    label: "Assign Roles",        roles: [1]      },
];

export default function App() {
  const [account,   setAccount]   = useState(null);
  const [contract,  setContract]  = useState(null);
  const [userRole,  setUserRole]  = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleConnect() {
    setLoading(true);
    setError("");
    try {
      const { signer, address } = await connectWallet();
      const c    = getContract(signer);
      const role = Number(await c.getRole(address));
      setAccount(address);
      setContract(c);
      setUserRole(role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!window.ethereum) return;
    const reset = () => { setAccount(null); setContract(null); setUserRole(0); };
    window.ethereum.on("accountsChanged", reset);
    window.ethereum.on("chainChanged",    reset);
    return () => {
      window.ethereum.removeListener("accountsChanged", reset);
      window.ethereum.removeListener("chainChanged",    reset);
    };
  }, []);

  const visibleTabs = TABS.filter(
    (t) => t.roles === null || t.roles.includes(userRole)
  );

  return (
    <div className="app">
      <Header
        account={account}
        userRole={userRole}
        onConnect={handleConnect}
        loading={loading}
      />

      {error && (
        <div className="error-banner" onClick={() => setError("")}>
          {error} <span style={{ float: "right", cursor: "pointer" }}>✕</span>
        </div>
      )}

      {account ? (
        <>
          <nav className="nav-tabs">
            {visibleTabs.map((t) => (
              <button
                key={t.id}
                className={`nav-tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <main className="main-content">
            {activeTab === "dashboard" && (
              <ProductList contract={contract} />
            )}
            {activeTab === "register" && userRole === 1 && (
              <RegisterProduct contract={contract} />
            )}
            {activeTab === "transfer" && [1, 2, 3].includes(userRole) && (
              <TransferOwnership contract={contract} account={account} />
            )}
            {activeTab === "history" && (
              <ProductHistory contract={contract} />
            )}
            {activeTab === "assign" && userRole === 1 && (
              <AssignRole contract={contract} />
            )}
          </main>
        </>
      ) : (
        <div className="connect-screen">
          <div className="connect-card">
            <div className="connect-icon">⛓</div>
            <h2>Supply Chain Management DApp</h2>
            <p className="connect-author">Muhammad Haris &mdash; 22L-6972</p>
            <p className="connect-hint">
              Connect your MetaMask wallet to interact with the supply chain.
              <br />
              Make sure you are connected to <strong>Polygon Amoy Testnet</strong>.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleConnect}
              disabled={loading}
            >
              {loading ? "Connecting…" : "Connect MetaMask"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

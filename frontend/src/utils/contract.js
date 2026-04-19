import { ethers } from "ethers";
import ABI from "./abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

export const ROLES = {
  0: "None",
  1: "Manufacturer",
  2: "Distributor",
  3: "Retailer",
  4: "Customer",
};

export const STATUSES = {
  0: "Manufactured",
  1: "In Transit",
  2: "Delivered",
};

export const STATUS_COLORS = {
  0: "#2563eb",
  1: "#d97706",
  2: "#16a34a",
};

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask not found. Please install the MetaMask browser extension."
    );
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer  = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

export function getContract(signerOrProvider) {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "Contract address not configured. Set VITE_CONTRACT_ADDRESS in frontend/.env"
    );
  }
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
}

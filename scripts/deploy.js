const { ethers } = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("  Muhammad Haris (22L-6972) — Supply Chain DApp");
  console.log("=".repeat(60));
  console.log("\nDeploying Muhammad_Haris_supplychain contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address :", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance :", ethers.formatEther(balance), "MATIC\n");

  const Contract = await ethers.getContractFactory("Muhammad_Haris_supplychain");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTx        = contract.deploymentTransaction();

  console.log("Contract address :", contractAddress);
  console.log("Transaction hash :", deployTx.hash);
  console.log("\n✅ Deployment successful!\n");
  console.log("─".repeat(60));
  console.log("Next steps:");
  console.log("  1. Copy the contract address above.");
  console.log("  2. Open frontend/.env and set:");
  console.log(`     VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("  3. Run: cd frontend && npm install && npm run dev");
  console.log("─".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

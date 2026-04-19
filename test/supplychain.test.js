const { expect }  = require("chai");
const { ethers }  = require("hardhat");

describe("Muhammad_Haris_supplychain", function () {
  // Role / Status mirrors the Solidity enums
  const Role   = { None: 0, Manufacturer: 1, Distributor: 2, Retailer: 3, Customer: 4 };
  const Status = { Manufactured: 0, InTransit: 1, Delivered: 2 };

  let contract;
  let owner, distributor, retailer, customer, stranger;

  beforeEach(async function () {
    [owner, distributor, retailer, customer, stranger] =
      await ethers.getSigners();

    const Factory = await ethers.getContractFactory(
      "Muhammad_Haris_supplychain"
    );
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ─── Deployment ─────────────────────────────────────────────────────────────

  describe("Deployment", function () {
    it("sets the deployer as contractOwner", async function () {
      expect(await contract.contractOwner()).to.equal(owner.address);
    });

    it("assigns Manufacturer role to deployer", async function () {
      expect(await contract.roles(owner.address)).to.equal(Role.Manufacturer);
    });

    it("starts with productCount = 0", async function () {
      expect(await contract.productCount()).to.equal(0n);
    });
  });

  // ─── Role Assignment ────────────────────────────────────────────────────────

  describe("Role Assignment", function () {
    it("lets the owner assign any role", async function () {
      await contract.assignRole(distributor.address, Role.Distributor);
      expect(await contract.roles(distributor.address)).to.equal(
        Role.Distributor
      );
    });

    it("emits RoleAssigned event", async function () {
      await expect(contract.assignRole(retailer.address, Role.Retailer))
        .to.emit(contract, "RoleAssigned")
        .withArgs(retailer.address, Role.Retailer);
    });

    it("reverts when a non-owner tries to assign roles", async function () {
      await expect(
        contract
          .connect(distributor)
          .assignRole(retailer.address, Role.Retailer)
      ).to.be.revertedWith("Not contract owner");
    });

    it("reverts on zero address", async function () {
      await expect(
        contract.assignRole(ethers.ZeroAddress, Role.Distributor)
      ).to.be.revertedWith("Invalid address");
    });
  });

  // ─── Product Registration ───────────────────────────────────────────────────

  describe("Product Registration", function () {
    it("lets a manufacturer register a product", async function () {
      await expect(contract.registerProduct("Widget A", "A sample widget"))
        .to.emit(contract, "ProductRegistered")
        .withArgs(1n, "Widget A", owner.address);

      expect(await contract.productCount()).to.equal(1n);
    });

    it("sets correct initial fields on the product", async function () {
      await contract.registerProduct("Widget A", "A sample widget");
      const p = await contract.getProduct(1n);

      expect(p.id).to.equal(1n);
      expect(p.name).to.equal("Widget A");
      expect(p.description).to.equal("A sample widget");
      expect(p.currentOwner).to.equal(owner.address);
      expect(p.status).to.equal(Status.Manufactured);
    });

    it("creates a history entry on registration", async function () {
      await contract.registerProduct("Widget A", "A sample widget");
      const history = await contract.getProductHistory(1n);

      expect(history.length).to.equal(1);
      expect(history[0].action).to.equal("Product Manufactured");
      expect(history[0].from).to.equal(ethers.ZeroAddress);
      expect(history[0].to).to.equal(owner.address);
    });

    it("reverts for a non-manufacturer caller", async function () {
      await expect(
        contract
          .connect(distributor)
          .registerProduct("Widget A", "A sample widget")
      ).to.be.revertedWith("Not a Manufacturer");
    });

    it("reverts when name is empty", async function () {
      await expect(
        contract.registerProduct("", "No name")
      ).to.be.revertedWith("Product name required");
    });
  });

  // ─── Ownership Transfer ─────────────────────────────────────────────────────

  describe("Ownership Transfer", function () {
    beforeEach(async function () {
      await contract.assignRole(distributor.address, Role.Distributor);
      await contract.assignRole(retailer.address,    Role.Retailer);
      await contract.assignRole(customer.address,    Role.Customer);
      await contract.registerProduct("Widget A", "A sample widget");
    });

    it("transfers product to distributor and updates status", async function () {
      await expect(
        contract.transferOwnership(1n, distributor.address, Status.InTransit)
      )
        .to.emit(contract, "OwnershipTransferred")
        .withArgs(1n, owner.address, distributor.address, Status.InTransit);

      const p = await contract.getProduct(1n);
      expect(p.currentOwner).to.equal(distributor.address);
      expect(p.status).to.equal(Status.InTransit);
    });

    it("records full audit trail through supply chain", async function () {
      await contract.transferOwnership(1n, distributor.address, Status.InTransit);
      await contract
        .connect(distributor)
        .transferOwnership(1n, retailer.address, Status.InTransit);
      await contract
        .connect(retailer)
        .transferOwnership(1n, customer.address, Status.Delivered);

      const history = await contract.getProductHistory(1n);
      expect(history.length).to.equal(4);
      expect(history[3].action).to.equal("Delivered");
    });

    it("reverts when caller is not the current owner", async function () {
      await expect(
        contract
          .connect(distributor)
          .transferOwnership(1n, retailer.address, Status.InTransit)
      ).to.be.revertedWith("Not current owner");
    });

    it("reverts when recipient has no role", async function () {
      await expect(
        contract.transferOwnership(1n, stranger.address, Status.InTransit)
      ).to.be.revertedWith("Recipient has no role assigned");
    });

    it("reverts for a non-existent product", async function () {
      await expect(
        contract.transferOwnership(99n, distributor.address, Status.InTransit)
      ).to.be.revertedWith("Product does not exist");
    });
  });
});

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Muhammad_Haris_supplychain
 * @author Muhammad Haris (22L-6972)
 * @notice Supply Chain Management Smart Contract deployed on Polygon Network
 * @dev Tracks products from Manufacturer → Distributor → Retailer → Customer
 */
contract Muhammad_Haris_supplychain {

    // ─── Enums ────────────────────────────────────────────────────────────────

    enum Role    { None, Manufacturer, Distributor, Retailer, Customer }
    enum Status  { Manufactured, InTransit, Delivered }

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct Product {
        uint256 id;
        string  name;
        string  description;
        address currentOwner;
        Status  status;
        bool    exists;
    }

    struct HistoryEntry {
        address from;
        address to;
        Status  status;
        uint256 timestamp;
        string  action;
    }

    // ─── State ────────────────────────────────────────────────────────────────

    address public contractOwner;
    uint256 public productCount;

    mapping(address => Role)              public roles;
    mapping(uint256 => Product)           public products;
    mapping(uint256 => HistoryEntry[])    private productHistory;

    // ─── Events ───────────────────────────────────────────────────────────────

    event RoleAssigned(
        address indexed account,
        Role            role
    );

    event ProductRegistered(
        uint256 indexed productId,
        string          name,
        address indexed manufacturer
    );

    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed from,
        address indexed to,
        Status          newStatus
    );

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Not contract owner");
        _;
    }

    modifier onlyManufacturer() {
        require(roles[msg.sender] == Role.Manufacturer, "Not a Manufacturer");
        _;
    }

    modifier productExists(uint256 productId) {
        require(products[productId].exists, "Product does not exist");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() {
        contractOwner = msg.sender;
        roles[msg.sender] = Role.Manufacturer;
        emit RoleAssigned(msg.sender, Role.Manufacturer);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function assignRole(address account, Role role) external onlyContractOwner {
        require(account != address(0), "Invalid address");
        roles[account] = role;
        emit RoleAssigned(account, role);
    }

    // ─── Core Functions ───────────────────────────────────────────────────────

    /**
     * @notice Register a new product. Only callable by a Manufacturer.
     * @param  name        Human-readable product name
     * @param  description Short product description
     * @return productId   The newly assigned product ID
     */
    function registerProduct(
        string memory name,
        string memory description
    ) external onlyManufacturer returns (uint256) {
        require(bytes(name).length > 0, "Product name required");

        productCount++;
        uint256 productId = productCount;

        products[productId] = Product({
            id:           productId,
            name:         name,
            description:  description,
            currentOwner: msg.sender,
            status:       Status.Manufactured,
            exists:       true
        });

        productHistory[productId].push(HistoryEntry({
            from:      address(0),
            to:        msg.sender,
            status:    Status.Manufactured,
            timestamp: block.timestamp,
            action:    "Product Manufactured"
        }));

        emit ProductRegistered(productId, name, msg.sender);
        return productId;
    }

    /**
     * @notice Transfer a product to a new owner and update its status.
     * @param  productId  ID of the product to transfer
     * @param  newOwner   Address of the recipient (must have a role assigned)
     * @param  newStatus  Updated supply-chain status after transfer
     */
    function transferOwnership(
        uint256 productId,
        address newOwner,
        Status  newStatus
    ) external productExists(productId) {
        Product storage product = products[productId];
        require(product.currentOwner == msg.sender, "Not current owner");
        require(newOwner != address(0),              "Invalid new owner address");
        require(roles[newOwner] != Role.None,        "Recipient has no role assigned");

        address previousOwner = product.currentOwner;
        product.currentOwner  = newOwner;
        product.status        = newStatus;

        productHistory[productId].push(HistoryEntry({
            from:      previousOwner,
            to:        newOwner,
            status:    newStatus,
            timestamp: block.timestamp,
            action:    _statusLabel(newStatus)
        }));

        emit OwnershipTransferred(productId, previousOwner, newOwner, newStatus);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function getProduct(uint256 productId)
        external
        view
        productExists(productId)
        returns (Product memory)
    {
        return products[productId];
    }

    function getProductHistory(uint256 productId)
        external
        view
        productExists(productId)
        returns (HistoryEntry[] memory)
    {
        return productHistory[productId];
    }

    function getRole(address account) external view returns (Role) {
        return roles[account];
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    function _statusLabel(Status s) internal pure returns (string memory) {
        if (s == Status.Manufactured) return "Product Manufactured";
        if (s == Status.InTransit)    return "In Transit";
        return "Delivered";
    }
}

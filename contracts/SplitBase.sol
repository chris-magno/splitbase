// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SplitBase
 * @notice Trustless bill-splitting on Base. No owner. No fees. No upgradability.
 * @dev Three events, four functions. Simplicity is the security.
 */
contract SplitBase is ReentrancyGuard {
    // ─── Errors ────────────────────────────────────────────────────────────────
    error NotMember();
    error AlreadyMember();
    error GroupNotFound();
    error AlreadySettled();
    error WrongSettlementAmount();
    error ZeroValue();
    error InvalidGroup();
    error TooManyMembers();

    // ─── Structs ───────────────────────────────────────────────────────────────
    struct Group {
        string name;
        address[] members;
        bool exists;
    }

    // ─── State ─────────────────────────────────────────────────────────────────
    uint256 private _groupCounter;

    /// @dev groupId => Group
    mapping(uint256 => Group) private groups;

    /// @dev groupId => address => isMember
    mapping(uint256 => mapping(address => bool)) public isMember;

    /// @dev groupId => debtor => creditor => amountOwed (in wei)
    mapping(uint256 => mapping(address => mapping(address => uint256))) public balances;

    // ─── Events ────────────────────────────────────────────────────────────────
    event GroupCreated(uint256 indexed groupId, address indexed creator, string name, address[] members);
    event ExpenseAdded(uint256 indexed groupId, address indexed paidBy, uint256 amount, string description);
    event Settled(uint256 indexed groupId, address indexed from, address indexed to, uint256 amount);

    // ─── Modifiers ─────────────────────────────────────────────────────────────
    modifier onlyMember(uint256 groupId) {
        if (!groups[groupId].exists) revert GroupNotFound();
        if (!isMember[groupId][msg.sender]) revert NotMember();
        _;
    }

    // ─── Functions ─────────────────────────────────────────────────────────────

    /**
     * @notice Create a new expense group
     * @param name  Human-readable group name (stored in event for indexing)
     * @param members Array of wallet addresses (resolved from Basenames off-chain)
     * @return groupId The new group's ID
     */
    function createGroup(string calldata name, address[] calldata members)
        external
        returns (uint256 groupId)
    {
        if (members.length == 0 || members.length > 50) revert TooManyMembers();

        groupId = ++_groupCounter;
        Group storage g = groups[groupId];
        g.name = name;
        g.exists = true;

        // Register creator
        g.members.push(msg.sender);
        isMember[groupId][msg.sender] = true;

        // Register additional members
        for (uint256 i = 0; i < members.length; i++) {
            address m = members[i];
            if (m == msg.sender || isMember[groupId][m]) continue;
            g.members.push(m);
            isMember[groupId][m] = true;
        }

        emit GroupCreated(groupId, msg.sender, name, g.members);
    }

    /**
     * @notice Log a shared expense. Payer sends ETH; contract splits it equally
     *         and records each member's debt back to the payer.
     * @param groupId    The group to charge
     * @param description Human-readable label (public on-chain — warn users)
     */
    function addExpense(uint256 groupId, string calldata description)
        external
        payable
        onlyMember(groupId)
        nonReentrant
    {
        if (msg.value == 0) revert ZeroValue();

        Group storage g = groups[groupId];
        uint256 memberCount = g.members.length;

        // Equal split — dust stays with payer (not trapped in contract)
        uint256 share = msg.value / memberCount;

        for (uint256 i = 0; i < memberCount; i++) {
            address member = g.members[i];
            if (member == msg.sender) continue; // payer owes nothing to themselves
            balances[groupId][member][msg.sender] += share;
        }

        emit ExpenseAdded(groupId, msg.sender, msg.value, description);
    }

    /**
     * @notice Settle a debt. Caller must send exact amount owed.
     *         Checks-Effects-Interactions pattern: balance zeroed BEFORE transfer.
     * @param groupId  The group containing the debt
     * @param creditor The address to pay
     */
    function settle(uint256 groupId, address payable creditor)
        external
        payable
        onlyMember(groupId)
        nonReentrant
    {
        uint256 owed = balances[groupId][msg.sender][creditor];
        if (owed == 0) revert AlreadySettled();
        if (msg.value != owed) revert WrongSettlementAmount();

        // Effects before interaction (reentrancy guard)
        balances[groupId][msg.sender][creditor] = 0;

        // Interaction — transfer() caps gas at 2300, preventing reentrancy
        creditor.transfer(msg.value);

        emit Settled(groupId, msg.sender, creditor, msg.value);
    }

    // ─── View Functions ────────────────────────────────────────────────────────

    function getGroup(uint256 groupId)
        external
        view
        returns (string memory name, address[] memory members, bool exists)
    {
        Group storage g = groups[groupId];
        return (g.name, g.members, g.exists);
    }

    function getBalance(uint256 groupId, address debtor, address creditor)
        external
        view
        returns (uint256)
    {
        return balances[groupId][debtor][creditor];
    }

    function groupCount() external view returns (uint256) {
        return _groupCounter;
    }
}

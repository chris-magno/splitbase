// ─── Contract ABI ──────────────────────────────────────────────────────────────
// Generated from SplitBase.sol — keep in sync with deployed contract
export const SPLITBASE_ABI = [
  // Events
  {
    type: "event",
    name: "GroupCreated",
    inputs: [
      { name: "groupId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "members", type: "address[]", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ExpenseAdded",
    inputs: [
      { name: "groupId", type: "uint256", indexed: true },
      { name: "paidBy", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "description", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Settled",
    inputs: [
      { name: "groupId", type: "uint256", indexed: true },
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  // Write functions
  {
    type: "function",
    name: "createGroup",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "members", type: "address[]" },
    ],
    outputs: [{ name: "groupId", type: "uint256" }],
  },
  {
    type: "function",
    name: "addExpense",
    stateMutability: "payable",
    inputs: [
      { name: "groupId", type: "uint256" },
      { name: "description", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "settle",
    stateMutability: "payable",
    inputs: [
      { name: "groupId", type: "uint256" },
      { name: "creditor", type: "address" },
    ],
    outputs: [],
  },
  // Read functions
  {
    type: "function",
    name: "getGroup",
    stateMutability: "view",
    inputs: [{ name: "groupId", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "members", type: "address[]" },
      { name: "exists", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "getBalance",
    stateMutability: "view",
    inputs: [
      { name: "groupId", type: "uint256" },
      { name: "debtor", type: "address" },
      { name: "creditor", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "isMember",
    stateMutability: "view",
    inputs: [
      { name: "groupId", type: "uint256" },
      { name: "address", type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "groupCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

// ─── Contract Address ──────────────────────────────────────────────────────────
// Filled in by deploy script — or set manually after deployment
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

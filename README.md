# SplitBase 💸

> Split bills with friends. Settle with ETH. No more "I'll pay you back."

Built on **Base** for the Base Hackathon · March 2026

## Quick Start

```bash
cp .env.example .env.local   # Fill in your keys
npm install                   # Install contract deps
npx hardhat test              # Run 9 tests
npx hardhat run scripts/deploy.ts --network base-sepolia
cd frontend && npm install && npm run dev
```

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for the full beginner guide.

## Stack

| Layer | Tech |
|---|---|
| Smart Contract | Solidity 0.8.20 + OpenZeppelin ReentrancyGuard |
| Chain | Base Sepolia → Base Mainnet |
| Frontend | Next.js 14 + OnchainKit + Wagmi v2 |
| Identity | Basenames (ENS on Base) |
| Wallet | Coinbase Smart Wallet (passkey / ERC-4337) |
| Deploy | Vercel (frontend) + Hardhat (contract) |

## Contract Functions

| Function | Description |
|---|---|
| `createGroup(name, members[])` | Create an on-chain expense group |
| `addExpense(groupId, description)` | Log a shared expense (payable) |
| `settle(groupId, creditor)` | Pay a debt and zero the balance |
| `getGroup(groupId)` | Read group name and members |

## Security

- No owner keys · No admin functions · No upgradability
- Checks-Effects-Interactions on all ETH transfers
- ReentrancyGuard on `addExpense` and `settle`
- Member gating on all write functions

---
*Council of 4 Experts: Web3 Product Lead · Protocol Architect · Onchain Growth Hacker · Security Officer*

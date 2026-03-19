# 🚀 SplitBase — Complete Beginner Setup Guide
### Built for the Base Hackathon · Council of 4 Experts Edition

---

## 🏛️ What the Council Says

| Expert | Verdict |
|---|---|
| **Web3 Product Lead** | *"SplitBase closes the loop Splitwise never could. This guide gets you to a live demo in under 90 minutes."* |
| **Protocol Architect** | *"Three events, four functions, zero admin keys. Follow Phase 1 exactly — don't add complexity."* |
| **Onchain Growth Hacker** | *"Every step below produces a shareable artifact. Deploy early, share the Basescan link with judges."* |
| **Security Officer** | *"Do NOT skip the `.env.local` step. Never commit your private key. Read the warnings in red."* |

---

## 📋 What You're Building

SplitBase is a **full-stack Web3 app** on Base (Ethereum L2) that lets friend groups:
1. **Create expense groups** — identified by Basenames (like alice.base.eth)
2. **Log shared expenses** — recorded permanently on the blockchain
3. **Settle debts with ETH** — one click, atomic transfer, balance zeroed on-chain

**No backend database. No user accounts. The smart contract IS the source of truth.**

---

## 🛠️ Prerequisites — Install These First

Before anything else, make sure you have:

### 1. Node.js (version 18 or 20)
```bash
# Check your version
node --version
# Should print: v18.x.x or v20.x.x

# If not installed, go to: https://nodejs.org
# Download the "LTS" version
```

### 2. Git
```bash
git --version
# If not installed: https://git-scm.com/downloads
```

### 3. A code editor
Download **VS Code** (free): https://code.visualstudio.com

### 4. Base Extension Wallet ✅ (PRIMARY — use this one)
This is the **Base Extension Wallet** — the official Base browser wallet shown in your screenshot.
- Chrome Web Store: https://chromewebstore.google.com/detail/base-wallet/oonmhmgnhgnoeoioikfnaoadhiaeoebh
- Install → Click the blue **Base** icon in your toolbar
- Click **"Create new wallet"** → Set a password → Save your seed phrase safely
- Supports BTC, ETH, and all ERC-20 tokens on Base natively
- After install, switch to **Base Sepolia** for testing:
  - Open the wallet → Click the network name → Select **Base Sepolia**

> The app also supports Coinbase Smart Wallet (mobile/passkey) and MetaMask as fallbacks.

### 5. Test ETH on Base Sepolia (free)
- Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Paste your wallet address and get free test ETH
- This is fake money for testing — it has zero real value

---

## 📁 Project Structure Overview

```
splitbase/
├── contracts/
│   └── SplitBase.sol          ← The smart contract (the brain)
├── test/
│   └── SplitBase.test.ts      ← Automated tests
├── scripts/
│   └── deploy.ts              ← Deploy script
├── frontend/
│   ├── app/                   ← Next.js pages
│   │   ├── page.tsx           ← Home page
│   │   ├── groups/new/        ← Create group page
│   │   ├── groups/[groupId]/  ← Group detail page
│   │   └── api/               ← Server-side API routes
│   ├── components/            ← React UI components
│   ├── hooks/                 ← Custom React hooks
│   └── lib/                   ← Config & ABI
├── .env.example               ← Copy this to .env.local
├── hardhat.config.ts          ← Blockchain tooling config
└── SETUP_GUIDE.md             ← You are here!
```

---

## ⚙️ Phase 0 — Environment Setup (5 minutes)

### Step 1: Open the project folder
```bash
# In your terminal, navigate to where you unzipped the project
cd splitbase
```

### Step 2: Create your secret environment file
```bash
# Copy the example file
cp .env.example .env.local
```

> ⚠️ **SECURITY WARNING from the Security Officer:**
> `.env.local` contains your private key and API keys.
> **NEVER** share this file, upload it to GitHub, or send it to anyone.
> The `.gitignore` file already blocks it from git — but double-check.

### Step 3: Get your API keys (fill in `.env.local`)

Open `.env.local` in VS Code and fill in each value:

#### a) DEPLOYER_PRIVATE_KEY — Your wallet's private key
```
# In Coinbase Wallet:
# Settings → Security → Show private key → Copy it
DEPLOYER_PRIVATE_KEY=0xYourActualPrivateKeyHere
```
> ⚠️ Never share this. This IS your wallet. Anyone with it controls your funds.

#### b) RPC_URL — A connection to Base Sepolia
Free option (Alchemy):
1. Go to https://alchemy.com → Sign up free
2. Create App → Network: **Base Sepolia**
3. Copy the HTTPS URL
```
RPC_URL=https://base-sepolia.g.alchemy.com/v2/your_key_here
```

Alternative (no signup needed for testing):
```
RPC_URL=https://sepolia.base.org
```

#### c) BASESCAN_API_KEY — For contract verification
1. Go to https://basescan.org/register → Create free account
2. My Account → API Keys → Add
```
BASESCAN_API_KEY=YourBasescanKeyHere
```

#### d) NEXT_PUBLIC_ONCHAINKIT_API_KEY — For Coinbase components
1. Go to https://portal.cdp.coinbase.com
2. Sign in with Coinbase → Create a project
3. Copy API key
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=YourOnchainKitKeyHere
```

---

## 🔨 Phase 1 — Smart Contract (30 minutes)

### Step 1: Install contract dependencies
```bash
# Make sure you're in the root splitbase/ folder
npm install
```
Wait for it to finish. This downloads Hardhat and OpenZeppelin contracts.

### Step 2: Compile the contract
```bash
npx hardhat compile
```

✅ **Expected output:**
```
Compiled 1 Solidity file successfully (evm target: paris).
```

If you see errors, they'll have line numbers pointing to `SplitBase.sol`.

### Step 3: Run the tests
```bash
npx hardhat test
```

✅ **Expected output:**
```
  SplitBase
    createGroup
      ✓ creates a group and emits GroupCreated
      ✓ registers creator as member
      ✓ increments groupCount
    addExpense
      ✓ splits expense equally and records balances
      ✓ reverts for non-members
      ✓ reverts for zero value
    settle
      ✓ transfers ETH to creditor and zeros balance
      ✓ reverts with WrongSettlementAmount if wrong value sent
      ✓ reverts with AlreadySettled on double-settle

  9 passing (2s)
```

If any test fails, **stop here and fix the issue** before deploying.

### Step 4: Deploy to Base Sepolia
```bash
npx hardhat run scripts/deploy.ts --network base-sepolia
```

✅ **Expected output:**
```
🚀 Deploying SplitBase on base-sepolia
   Deployer: 0xYourAddress
   Balance : 0.1 ETH

✅ SplitBase deployed at: 0xABCDEF1234...
   Tx hash: 0x...

📝 Contract address written to frontend/lib/contract-address.ts

✅ Contract verified on Basescan
```

> ⚠️ If deployment fails with "insufficient funds":
> Go back to Step 5 in Prerequisites and get free test ETH from the faucet.

### Step 5: Save your contract address
The deploy script automatically writes the address to `frontend/lib/contract-address.ts`.
**Also copy it manually** to `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
```

### Step 6: Verify on Basescan (the Onchain Growth Hacker says judges love this)
```bash
npx hardhat verify --network base-sepolia YOUR_CONTRACT_ADDRESS
```
Then visit: `https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS`

You'll see your contract source code publicly available. **Share this link with hackathon judges.**

---

## 🌐 Phase 2 — Frontend Setup (20 minutes)

### Step 1: Navigate to the frontend folder
```bash
cd frontend
```

### Step 2: Install frontend dependencies
```bash
npm install
```
This will take 1–2 minutes. It downloads React, Next.js, OnchainKit, and Wagmi.

### Step 3: Copy environment variables to frontend
The frontend needs the same `.env.local` variables.
```bash
# From the frontend/ folder
cp ../.env.local .env.local
```

### Step 4: Start the development server
```bash
npm run dev
```

✅ **Expected output:**
```
▲ Next.js 14.2.3
   - Local:        http://localhost:3000

 ✓ Ready in 2.3s
```

### Step 5: Open the app
Open your browser and go to: **http://localhost:3000**

You should see the SplitBase landing page with "Connect Wallet" button.

---

## 🧪 Phase 3 — Testing the Full Flow (15 minutes)

Follow this exact sequence to test the happy path:

### Test 1: Connect Wallet
1. Click "Connect Wallet" on the home page
2. A wallet picker appears with 3 options
3. **Select "Base Wallet"** (the blue 🔵 option — recommended)
4. The Base Extension Wallet popup opens in your browser
5. Approve the connection
6. ✅ Your Basename (or address) appears in the navbar

> No Base Wallet installed? The picker also shows Coinbase Smart Wallet (passkey/FaceID on mobile) and MetaMask.

### Test 2: Create a Group
1. Click "+ New Group"
2. Enter a group name: "Test Group"
3. In the member input, type a Basename (e.g., `alice`)
   - The app resolves it to a wallet address automatically
   - Green checkmark = found ✅
   - Red = not found (try registering at base.org/names)
4. Click "Add", then "Create Group on Base"
5. Wallet popup → Confirm transaction
6. ✅ Group appears on home page

### Test 3: Add an Expense
1. Click on your group
2. Click "+ Add Expense"
3. Enter description: "Dinner"
4. Enter amount: `30` (USD)
5. See the ETH conversion live
6. See the split preview: $30 ÷ 2 members = $15 each
7. Click "Log Expense on Base"
8. Wallet popup → Confirm
9. ✅ Balance appears: "You owe alice 0.00XXX ETH"

### Test 4: Settle a Debt
1. On the group page, see the "You Owe" section
2. Click "Settle" next to the creditor
3. The exact amount is pre-filled
4. Wallet popup → Confirm
5. 🎉 Confetti animation!
6. ✅ "Settled!" badge appears with Basescan link

### Test 5: Verify on Basescan
Click the "View on Basescan" link after settling.
You should see your transaction on-chain with:
- `settle` function call
- ETH value transferred
- Event emitted: `Settled`

---

## 🚀 Phase 4 — Deploy to Production (Vercel)

### Step 1: Push to GitHub
```bash
# From the splitbase/ root
git init
git add .
git commit -m "Initial SplitBase commit"

# Create a new repo at github.com, then:
git remote add origin https://github.com/YOURUSERNAME/splitbase.git
git push -u origin main
```

> ✅ GitHub will NOT include `.env.local` (it's in .gitignore)

### Step 2: Deploy on Vercel (free)
1. Go to https://vercel.com → Sign up with GitHub
2. Click "New Project" → Import your `splitbase` repo
3. **IMPORTANT**: Set Root Directory to `frontend`
4. Click "Environment Variables" and add ALL variables from `.env.local`:
   - `NEXT_PUBLIC_NETWORK` = `sepolia`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = your deployed address
   - `NEXT_PUBLIC_ONCHAINKIT_API_KEY` = your key
   - `RPC_URL` = your Alchemy URL
5. Click "Deploy"
6. ✅ Your app is live at `https://splitbase-xxx.vercel.app`

### Step 3: Share the live URL
- With hackathon judges
- On Warpcast/Farcaster with the Basescan contract link
- In your hackathon submission

---

## 🔧 Troubleshooting

### "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### "Insufficient funds for gas"
- Get free Base Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Contract not found / 0x000... address
- Check `.env.local` has `NEXT_PUBLIC_CONTRACT_ADDRESS` set correctly
- Re-run `npm run dev` after editing `.env.local`

### "Basename not found" for members
- The person needs to register a Basename at https://www.base.org/names
- For testing, use raw wallet addresses instead (0x...)

### MetaMask instead of Coinbase Wallet
- The app is configured for Coinbase Smart Wallet (`smartWalletOnly`)
- For hackathon judging, change in `frontend/lib/providers.tsx`:
  ```ts
  preference: "all" // instead of "smartWalletOnly"
  ```

### TypeScript errors on build
```bash
# Check types
npx tsc --noEmit
# Fix any errors before deploying
```

---

## 🏆 Hackathon Submission Checklist

Before 4:00 PM deadline, confirm you have:

- [ ] Contract deployed on Base Sepolia
- [ ] Contract verified on Basescan (source code visible)
- [ ] All 9 tests passing (`npx hardhat test`)
- [ ] Frontend deployed on Vercel (live URL works)
- [ ] Full happy path demo works: create group → add expense → settle
- [ ] Basescan contract address ready to share
- [ ] 2-minute demo video recorded (screen record the happy path)
- [ ] 3-sentence pitch written: problem → solution → Base-native angle

---

## 📖 Key Concepts Explained (For Beginners)

### What is a smart contract?
A program that runs on the blockchain. Once deployed, nobody can change it — not even you. `SplitBase.sol` is ~120 lines that handles all the logic.

### What is Base?
An Ethereum Layer 2 blockchain made by Coinbase. Transactions cost ~$0.001 instead of $5–15 on Ethereum mainnet. Same security, fraction of the cost.

### What is a Basename?
Like an ENS domain but for Base. `alice.base.eth` maps to a wallet address, like how a domain maps to an IP. The app resolves names to addresses before calling the contract.

### What is a Paymaster?
A service that pays gas fees on behalf of users. New users don't need ETH just to try the app. Configured via OnchainKit — not needed for hackathon (Sepolia gas is free anyway).

### What is msg.value?
When a user calls `addExpense()`, they send ETH with the transaction. `msg.value` is that ETH amount. The contract reads it to calculate shares.

### Why Checks-Effects-Interactions?
In `settle()`, the balance is zeroed (the "effect") BEFORE the ETH is sent (the "interaction"). This prevents reentrancy attacks where a malicious contract could re-enter `settle()` before the balance is zeroed.

---

*SplitBase · Built for Base Hackathon · March 19, 2026*
*Council of 4 Experts: Web3 Product Lead · Protocol Architect · Onchain Growth Hacker · Security Officer*

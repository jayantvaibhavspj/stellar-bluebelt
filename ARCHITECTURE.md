# 🏗️ StellarFlow — Architecture Document

## System Overview

StellarFlow is a decentralized payment streaming application built on Stellar Testnet. It allows users to create continuous XLM payment streams using Soroban smart contracts.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                         │
│                                                          │
│  ┌─────────────────────┐    ┌──────────────────────┐    │
│  │   React Frontend     │    │  Freighter Wallet    │    │
│  │   (Vite + JSX)       │◄──►│  Extension           │    │
│  │                      │    │  (freighter-api v6)  │    │
│  └──────────┬───────────┘    └──────────────────────┘    │
└─────────────┼───────────────────────────────────────────┘
              │
              │ HTTPS / Stellar SDK
              │
┌─────────────▼───────────────────────────────────────────┐
│              STELLAR TESTNET NETWORK                      │
│                                                          │
│  ┌─────────────────────┐    ┌──────────────────────┐    │
│  │  Soroban RPC Server  │    │  Horizon Server      │    │
│  │  soroban-testnet     │    │  horizon-testnet     │    │
│  │  .stellar.org        │    │  .stellar.org        │    │
│  └──────────┬───────────┘    └──────────┬───────────┘    │
│             │                           │                 │
│             │                           │ Account/Balance │
│  ┌──────────▼───────────────────────────▼───────────┐    │
│  │         STELLAR LEDGER (Testnet)                  │    │
│  │                                                   │    │
│  │  ┌─────────────────────────────────────────┐     │    │
│  │  │     StellarFlow Soroban Contract         │     │    │
│  │  │  CDVKXMYN2STPUCCUY742YSNHTM3KJFPPJIW3   │     │    │
│  │  │  CKMS7N6SIS3IWKHXS3RJ                   │     │    │
│  │  │                                          │     │    │
│  │  │  Storage:                                │     │    │
│  │  │  • StreamCount (u64)                     │     │    │
│  │  │  • Stream(id) → Stream struct            │     │    │
│  │  │                                          │     │    │
│  │  │  Functions:                              │     │    │
│  │  │  • create_stream()                       │     │    │
│  │  │  • withdrawable()                        │     │    │
│  │  │  • withdraw()                            │     │    │
│  │  │  • cancel_stream()                       │     │    │
│  │  │  • get_stream()                          │     │    │
│  │  │  • get_stream_count()                    │     │    │
│  │  └─────────────────────────────────────────┘     │    │
│  └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Smart Contract (Rust / Soroban)

**File:** `stellarflow-contract/contracts/hello-world/src/lib.rs`

#### Data Structures

```rust
pub struct Stream {
    pub sender: Address,
    pub receiver: Address,
    pub rate_per_second: i128,   // stroops per second
    pub start_time: u64,         // ledger timestamp
    pub end_time: u64,           // start + duration
    pub withdrawn: i128,         // already withdrawn
    pub is_active: bool,         // active or cancelled
    pub deposited: i128,         // total deposited
}
```

#### Storage Keys
```rust
pub enum DataKey {
    Stream(u64),      // stream_id → Stream
    StreamCount,      // total streams created
    Balance(Address), // (reserved for future use)
}
```

#### Core Logic — `withdrawable()`
```
elapsed = min(now, end_time) - start_time
earned = rate_per_second × elapsed
available = earned - already_withdrawn
capped = min(available, deposited - withdrawn)
```

---

### 2. Frontend (React + Vite)

**File:** `frontend/src/App.jsx`

#### State Management
```
publicKey     → connected wallet address
balance       → XLM balance (refreshes every 15s)
streamCount   → total streams on contract
loading       → wallet connection loading state
error/success → user feedback messages
```

#### Transaction Flow
```
User fills form
  → TransactionBuilder creates Soroban invoke tx
  → SorobanRpc.prepareTransaction() simulates + gets fees
  → freighterApi.signTransaction() → user approves in wallet
  → SorobanRpc.sendTransaction() → broadcasts to network
  → Success message shown
```

---

### 3. Wallet Integration (Freighter API v6)

| Function | Purpose |
|----------|---------|
| `freighterApi.isConnected()` | Check if Freighter installed |
| `freighterApi.requestAccess()` | Ask user permission |
| `freighterApi.getAddress()` | Get user's public key |
| `freighterApi.signTransaction()` | Sign XDR transaction |

---

## Data Flow

### Create Stream Flow
```
1. User enters: receiver, rate, duration, deposit
2. Frontend builds TransactionBuilder with create_stream call
3. SorobanRpc prepares transaction (simulates fees)
4. Freighter wallet signs the XDR
5. Transaction broadcast to Stellar Testnet
6. Contract stores Stream struct on-chain
7. Event emitted: CREATED
8. Frontend shows success + TX hash
```

### Withdraw Flow (Future)
```
1. Receiver connects wallet
2. Frontend calls withdrawable() to simulate
3. Shows available amount
4. Receiver clicks Withdraw
5. Contract calculates elapsed time
6. Updates withdrawn amount on-chain
7. Event emitted: WITHDRAWN
```

---

## Security Considerations

- **Auth required:** `create_stream` requires sender auth, `withdraw` requires receiver auth, `cancel_stream` requires sender auth
- **Overflow protection:** All math uses `i128` with bounds checking
- **Testnet only:** Contract deployed on Stellar Testnet, no real funds at risk

---

## Deployment

| Component | Platform | URL |
|-----------|---------|-----|
| Frontend | Vercel | https://stellar-bluebelt.vercel.app |
| Contract | Stellar Testnet | CDVKXMYN2STPUCCUY742YSNHTM3KJFPPJIW3CKMS7N6SIS3IWKHXS3RJ |

---

## Future Architecture (Phase 2)

- **StreamFactory pattern** — factory contract spawning individual stream contracts
- **Token support** — stream any Stellar asset, not just XLM
- **Inter-contract calls** — factory calls stream contracts directly
- **Indexer** — off-chain indexing of stream events for fast queries

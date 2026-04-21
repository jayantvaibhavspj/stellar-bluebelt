# 💧 StellarFlow — Programmable Payment Streams on Stellar

> **Stream money like water** — real-time continuous payment streaming built on Stellar Testnet using Soroban smart contracts.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-blue)](https://stellarflow-jayant.netlify.app)
[![Testnet Contract](https://img.shields.io/badge/Contract-Testnet-green)](https://stellar.expert/explorer/testnet/contract/CDVKXMYN2STPUCCUY742YSNHTM3KJFPPJIW3CKMS7N6SIS3IWKHXS3RJ)

---

## 🚀 Live Demo

🔗 **[https://stellarflow-jayant.netlify.app](https://stellarflow-jayant.netlify.app)**

📹 **Demo Video:** *(add YouTube link after recording)*

---

## 📌 What is StellarFlow?

StellarFlow enables **real-time continuous payment streaming** on the Stellar testnet. Instead of sending lump-sum payments, users can open a "stream" that continuously transfers XLM from sender to receiver — per second, per minute, or per hour.

### Use Cases
- 💼 **Salary streaming** — pay employees per second
- 🎨 **Creator subscriptions** — support streamers continuously
- 📈 **Token vesting** — automated vesting schedules
- 🔧 **Freelance payments** — milestone-based streaming

---

## ✨ Features

- ✅ Create payment streams with custom rate & duration
- ✅ Real-time XLM balance display
- ✅ Withdraw accrued balance anytime (receiver)
- ✅ Cancel stream anytime (sender)
- ✅ Multiple simultaneous streams
- ✅ Freighter wallet integration
- ✅ Fully responsive UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Rust / Soroban SDK |
| Frontend | React + Vite |
| Wallet | Freighter (@stellar/freighter-api v6) |
| Stellar SDK | @stellar/stellar-sdk |
| Deployment | Netlify |
| Network | Stellar Testnet |

---

## 📐 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full system design.

**Contract ID (Testnet):**
```
CDVKXMYN2STPUCCUY742YSNHTM3KJFPPJIW3CKMS7N6SIS3IWKHXS3RJ
```

**Contract Functions:**
- `create_stream(sender, receiver, rate_per_second, duration, deposit)` → stream_id
- `withdrawable(stream_id)` → amount
- `withdraw(stream_id, receiver)` → amount
- `cancel_stream(stream_id, sender)`
- `get_stream(stream_id)` → Stream
- `get_stream_count()` → u64

---

## 👥 Testnet Users

| # | Name | Wallet Address | Feedback Score |
|---|------|----------------|----------------|
| 1 | *(add after onboarding)* | *(G...address)* | ⭐⭐⭐⭐⭐ |
| 2 | *(add after onboarding)* | *(G...address)* | ⭐⭐⭐⭐⭐ |
| 3 | *(add after onboarding)* | *(G...address)* | ⭐⭐⭐⭐ |
| 4 | *(add after onboarding)* | *(G...address)* | ⭐⭐⭐⭐⭐ |
| 5 | *(add after onboarding)* | *(G...address)* | ⭐⭐⭐⭐ |

---

## 📊 User Feedback

**Google Form:** [Fill Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfODeDhqYjEzOV02cIpGuA7hBMmDUts59QJSzAVLMFmLNpVkA/viewform)

**Exported Excel Sheet:** *(add after collecting responses)*

---

## 🔄 Improvement Plan (Based on User Feedback)

After collecting feedback from 5+ testnet users, the following improvements will be implemented:

### Iteration 1 (Completed)
- ✅ Fixed Freighter wallet connection (upgraded to freighter-api v6)
- ✅ Improved error handling and user messages
- ✅ Added real-time balance refresh every 15 seconds
- ✅ Deployed to public Netlify URL
- 🔗 Commit: [086a6a4](https://github.com/jayantvaibhavspj/stellar-bluebelt/commit/086a6a4)

### Planned Improvements (Phase 2)
1. **Stream Dashboard** — show all active streams with live countdown timers
2. **Withdraw UI** — receiver can withdraw directly from frontend
3. **Cancel Stream UI** — sender can cancel from dashboard
4. **Real-time Animated Counter** — XLM counter updating every second
5. **Stream History** — past streams with Stellar Explorer transaction links

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Rust + Stellar CLI
- Freighter wallet browser extension

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Contract Build
```bash
cd stellarflow-contract
stellar contract build
```

### Contract Deploy
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source-account alice \
  --network testnet
```

---

## 📁 Project Structure

```
stellar-bluebelt/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx            # Main application
│   │   └── App.css            # Styles
│   └── package.json
├── stellarflow-contract/      # Soroban smart contract
│   └── contracts/hello-world/
│       ├── src/
│       │   ├── lib.rs         # Contract logic
│       │   └── tests.rs       # Unit tests
│       └── Cargo.toml
├── ARCHITECTURE.md            # System architecture
└── README.md
```

---

## 🧪 Tests

```bash
cd stellarflow-contract
cargo test
```

**Test Results:** 4/4 passing ✅
- `test_create_stream`
- `test_withdrawable`
- `test_cancel_stream`
- `test_stream_count`

---

## 📜 License

MIT License — Built for Stellar Blue Belt Challenge 🔵
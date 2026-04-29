# 💧 StellarFlow — Programmable Payment Streams on Stellar

> **Stream money like water** — real-time continuous payment streaming built on Stellar Testnet using Soroban smart contracts.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-blue)](https://stellarflow-jayant.netlify.app)
[![Testnet Contract](https://img.shields.io/badge/Contract-Testnet-green)](https://stellar.expert/explorer/testnet/contract/CDVKXMYN2STPUCCUY742YSNHTM3KJFPPJIW3CKMS7N6SIS3IWKHXS3RJ)

---

## 🚀 Live Demo

🔗 **[https://stellarflow-jayant.netlify.app](https://stellarflow-jayant.netlify.app)**

📹 **Demo Video:   https://drive.google.com/file/d/1kuK3D9QfPHN2QiOlYyVtktcHeINp_OI7/view?usp=drive_link

## 🚀 userfeedback form response sheet 

https://docs.google.com/spreadsheets/d/1SXETt1Yu1dGBEPicQmG_Qbc1RXPtTLD7G7lkYwUbOo0/edit?usp=sharing

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
- ✅ **NEW:** Stream History Dashboard (view all your created streams)
- ✅ **NEW:** Stroops ↔ XLM Bidirectional Converter
- ✅ **NEW:** Smart Input Validation with Cost Calculator
- ✅ **NEW:** Receiver Dashboard (view incoming streams)
- ✅ **NEW:** Detailed Stream Information Display

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

## 👥 Level 5: User Onboarding & Feedback

### Table 1: Onboarded Users (5 Users)

| # | User Name | User Email | User Wallet Address |
|---|-----------|-----------|---|
| 1 | Abhishek Gupta | abhishekgupta0834@gmail.com | GBEA2LH5VILCEKQC6M77GXGJ3CPJOOMGEKNMMNXQXMJA42BMPX4YSN72 |
| 2 | Saurabh Kumar | saurabhkumar20k5@gmail.com | GDPQMIGKM2YC4LDMMUTWU35CMRSJKWVYH2QW6EU3XIE7AWPUVKLRMJGP |
| 3 | Prithwiraj Das | prithwirajdas84@gmail.com | GDNCZO2EUNABT3D6PV7GIBUWCPLJBT5EG4PXN7HSDR5LGZVHI5HSZ2MI |
| 4 | Prashant Vaibhav | prashantvaibhavlnmcb@gmail.com | GAUGBIDSUADNR2R57GJ3NVA2N22JQYLKLIPVU2ODINAHRXYVJ3SKEE7W |
| 5 | Sarvesh Choudhary | sarveshchoudhary2606@gmail.com | GBAVDHPWSB6XGO2LVVOPZF5RCQVGDIZI3MTA7GIOAFQ |

### Table 2: User Feedback Implementation Log

| User Name | User Email | User Wallet Address | Feedback | Implementation | Status |
|-----------|-----------|---|---------|---|---|
| Abhishek Gupta | abhishekgupta0834@gmail.com | GBEA2LH5VILCEKQC6M77GXGJ3CPJOOMGEKNMMNXQXMJA42BMPX4YSN72 | Stream Details Display — Shows after creation | Feature 5: Stream Details added with TX hash, receiver, rate, duration, cost in XLM/stroops, and timestamp | ✅ Implemented |
| Saurabh Kumar | saurabhkumar20k5@gmail.com | GDPQMIGKM2YC4LDMMUTWU35CMRSJKWVYH2QW6EU3XIE7AWPUVKLRMJGP | Stroops to XLM converter tab must needed | Feature 2: Bidirectional Stroops ↔ XLM converter in "Tools" tab with real-time conversion | ✅ Implemented |
| Prithwiraj Das | prithwirajdas84@gmail.com | GDNCZO2EUNABT3D6PV7GIBUWCPLJBT5EG4PXN7HSDR5LGZVHI5HSZ2MI | Smart Input Validation and Calculator missing | Feature 3: Smart validation with address format check, balance verification, deposit vs cost matching, and XLM conversion display | ✅ Implemented |
| Prashant Vaibhav | prashantvaibhavlnmcb@gmail.com | GAUGBIDSUADNR2R57GJ3NVA2N22JQYLKLIPVU2ODINAHRXYVJ3SKEE7W | Receiver Dashboard will be better to use | Feature 4: Receiver Dashboard tab added with framework ready for receiving streams | ✅ Implemented |
| Sarvesh Choudhary | sarveshchoudhary2606@gmail.com | GBAVDHPWSB6XGO2LVVOPZF5RCQVGDIZI3MTA7GIOAFQ | Stream History & Management "My Streams" tab | Feature 1: My Streams tab showing all created streams with receiver, rate, duration, cost, timestamp, and TX hash | ✅ Implemented |

---

## 📝 Features Implemented (Based on User Feedback Analysis)

These features have been **proactively implemented** based on common user needs identified during development:

### ✅ Feature 1: Stream History & Management
- **Description:** View all created streams with detailed information (receiver, rate, duration, cost)
- **Location:** "My Streams" tab in the dashboard
- **Benefit:** Users can track all active streams and their details
- **Commit:** Ready for next deployment

### ✅ Feature 2: Stroops ↔ XLM Converter
- **Description:** Bidirectional converter between stroops and XLM with real-time calculation
- **Location:** "Tools" tab → Conversion Tools
- **Benefit:** Eliminates confusion about stroops (1 XLM = 10,000,000 stroops)
- **Commit:** Ready for next deployment

### ✅ Feature 3: Smart Input Validation & Cost Calculator
- **Description:** Real-time validation of all inputs with helpful error messages and cost breakdown
- **Location:** Create Stream form with live validation feedback
- **Validations Include:**
  - Wallet address format verification
  - Sufficient balance checking
  - Deposit vs cost matching
  - Real-time XLM conversion display
- **Commit:** Ready for next deployment

### ✅ Feature 4: Receiver Dashboard
- **Description:** Dashboard for users receiving streams to view incoming payment streams
- **Location:** "Receiving" tab
- **Status:** Framework ready (ready for contract integration)
- **Commit:** Ready for next deployment

### ✅ Feature 5: Stream Details Display
- **Description:** Detailed stream information after creation with transaction hash and full breakdown
- **Location:** Success message and "My Streams" tab
- **Details Shown:**
  - Transaction hash
  - Receiver address (truncated)
  - Stream parameters (rate, duration, cost in both stroops and XLM)
  - Creation timestamp
- **Commit:** Ready for next deployment

---

## 📊 Google Feedback Form

**Please fill out this form with your feedback:**
[👉 StellarFlow User Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfODeDhqYjEzOV02cIpGuA7hBMmDUts59QJSzAVLMFmLNpVkA/viewform)

---

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

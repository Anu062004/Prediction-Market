# FlashBet - Ultra-Fast Prediction Market dApp

A full-stack prediction market built on Linera microchains with instant finality and AI-powered odds.

## 🚀 Features

- **Ultra-fast markets**: Open and resolve within minutes using Linera's instant finality
- **AI-powered odds**: Real-time odds calculation using machine learning
- **Microchain architecture**: Each market runs on its own Linera microchain
- **Real-time updates**: WebSocket-powered live odds and instant payouts
- **Modern UI**: React + Tailwind with dark neon theme

## 📁 Project Structure

```
flashbet/
├── contracts/          # Linera smart contracts (Rust)
├── backend/            # Node.js API server
├── ai-engine/          # Python FastAPI odds engine
├── frontend/           # React + Vite frontend
├── scripts/            # Deployment and utility scripts
└── docs/              # Documentation
```

## 🔧 Prerequisites

- Rust (1.70+)
- Node.js (20+)
- Python (3.10+)
- Linera CLI

## 🚀 Quick Start

1. Install dependencies:
```bash
./scripts/install_deps.sh
```

2. Start all services:
```bash
./scripts/run_local.sh
```

3. Open http://localhost:3000

## 🏗️ Development

See individual README files in each directory for detailed setup instructions.
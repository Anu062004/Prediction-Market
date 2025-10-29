# FlashBet + Games/Wallet/AI Extension

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
├── contracts/              # Linera smart contracts (Rust)
├── backend/                # Legacy API server (kept)
├── backend-api/            # NEW Fastify TS API (games, wallet, websockets)
├── wallet-service/         # Hot wallet deposit/withdraw service
├── game-service/           # Seed commit/reveal microservice
├── games/
│   ├── mines/              # Phaser 3 web build
│   └── aviator/            # Unity/Godot WebGL placeholder
├── linera-watcher/         # Node watcher for Linera deposits
├── ai-engine/              # Python FastAPI AI + /recommend
├── infra/                  # docker-compose, nginx, postgres init
├── tools/                  # verify_round.js
└── docs/                   # acceptance + security checklist
```

## 🔧 Prerequisites

- Rust (1.70+)
- Node.js (20+)
- Python (3.10+)
- Linera CLI

## 🚀 Quick Start (Docker)

1. Install dependencies:
```bash
./scripts/install_deps.sh
```

2. Start all services:
```bash
docker compose -f infra/docker-compose.yml up --build -d
```

3. Open services
   - API: http://localhost:3000
   - AI:  http://localhost:8001
   - Games: http://localhost/mines/ and http://localhost/aviator/

4. Tests
```bash
npm --prefix backend-api test
```

## 🏗️ Development

See individual README files in each directory for detailed setup instructions.
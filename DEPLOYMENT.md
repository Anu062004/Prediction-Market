# FlashBet Deployment Guide

## 🚀 Quick Start

### Prerequisites
- ✅ Rust 1.70+ (installed)
- ✅ Node.js 20+ (installed) 
- ✅ Python 3.11+ (installed)

### Installation & Setup

1. **Install Dependencies**
```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies  
cd frontend && npm install

# AI Engine dependencies
cd ai-engine && python -m pip install -r requirements.txt
```

2. **Environment Configuration**
```bash
# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env
```

3. **Start Services**

**Option A: Manual Start (Recommended)**
```bash
# Terminal 1: AI Engine
cd ai-engine
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Backend
cd backend  
npm start

# Terminal 3: Frontend
cd frontend
npm run dev
```

**Option B: Batch Script (Windows)**
```bash
./scripts/run_local.bat
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **AI Engine**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Node.js Backend│    │ Python AI Engine│
│   (Port 3000)   │◄──►│   (Port 8000)   │◄──►│   (Port 8001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│ Linera Contracts│◄─────────────┘
                        │  (Simulated)    │
                        └─────────────────┘
```

## 🔧 Features Implemented

### ✅ Core Features
- **Market Creation**: Create prediction markets with custom outcomes
- **Betting System**: Place bets with real-time odds updates
- **AI Odds Engine**: Machine learning powered probability calculations
- **Real-time Updates**: WebSocket connections for live data
- **Wallet Integration**: Simulated Linera wallet with balance management
- **Market Resolution**: Automatic payout calculation and distribution

### ✅ Technical Features
- **Microchain Architecture**: Each market runs independently
- **Instant Finality**: Simulated instant transaction confirmation
- **Responsive UI**: Modern React interface with Tailwind CSS
- **Real-time Communication**: Socket.io for live updates
- **RESTful API**: Complete backend API with proper error handling

## 🎯 Usage Examples

### Creating a Market
1. Connect wallet
2. Navigate to "Create Market"
3. Enter question and outcomes
4. Set expiry time
5. Submit transaction

### Placing Bets
1. Browse active markets
2. Click on desired market
3. Select outcome and amount
4. Confirm bet transaction
5. View real-time odds updates

### Market Resolution
Markets automatically resolve at expiry time or can be manually resolved by authorized users.

## 🔮 Next Steps for Production

1. **Linera Integration**: Replace simulated contracts with real Linera deployment
2. **Oracle Integration**: Connect to Chainlink or other oracle services
3. **Enhanced AI**: Implement more sophisticated ML models
4. **Security Audit**: Comprehensive security review
5. **Scalability**: Database integration and caching
6. **Mobile App**: React Native mobile application

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill processes on ports
npx kill-port 3000 8000 8001
```

**Python Module Not Found**
```bash
# Ensure Python packages are installed
cd ai-engine
python -m pip install -r requirements.txt
```

**Node Modules Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📊 Current Status

- ✅ **Backend**: Fully functional with market management
- ✅ **Frontend**: Complete UI with all features
- ✅ **AI Engine**: Basic odds calculation working
- ✅ **Real-time**: WebSocket communication active
- 🔄 **Linera**: Simulated (ready for real integration)

The FlashBet dApp is now fully functional in development mode with all core features working!
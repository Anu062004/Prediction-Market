#!/bin/bash

echo "🚀 Installing FlashBet Dependencies..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.10+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+ first."
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust not found. Please install Rust first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd ai-engine
python -m pip install -r requirements.txt
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd backend
npm install
cd ../frontend
npm install
cd ..

# Build Rust contracts
echo "🔨 Building Rust contracts..."
cd contracts
cargo build --release
cd ..

echo "✅ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure"
echo "2. Run ./scripts/run_local.sh to start all services"
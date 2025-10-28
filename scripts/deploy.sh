#!/bin/bash

echo "🚀 FlashBet Contract Deployment Script"
echo "======================================"

# Check if Docker is running
if ! docker ps | grep -q synapsenet-linera; then
    echo "❌ Linera container not running. Starting..."
    docker start synapsenet-linera
    sleep 5
fi

# Check if wallet exists
echo "📋 Checking Linera wallet..."
docker exec synapsenet-linera linera wallet show || {
    echo "⚠️  No wallet found. Initializing test wallet..."
    docker exec synapsenet-linera linera wallet init --with-test-accounts 2
}

# Copy contracts to container
echo "📦 Copying contracts to Docker container..."
docker cp contracts/. synapsenet-linera:/app/contracts

# Build contracts inside Docker
echo "🔨 Building contracts..."
docker exec -w /app/contracts synapsenet-linera sh -c "
    # Install wasm32 target if needed
    rustup target add wasm32-unknown-unknown 2>/dev/null || true
    
    # Build for WASM
    cargo build --release --target wasm32-unknown-unknown
    
    echo '✅ Build complete!'
"

# Deploy factory contract
echo "📤 Deploying Market Factory contract..."
FACTORY_OUTPUT=$(docker exec synapsenet-linera sh -c "
    linera publish-and-create \
        /app/contracts/target/wasm32-unknown-unknown/release/market_factory.wasm \
        --json-argument '{}' \
        --json-initial-instance-argument '{\"next_market_id\": 1}' \
        2>&1
")

echo "$FACTORY_OUTPUT"

# Extract contract address
FACTORY_ADDRESS=$(echo "$FACTORY_OUTPUT" | grep -oP 'e\w{60,}' | head -1)

if [ -n "$FACTORY_ADDRESS" ]; then
    echo "✅ Factory deployed at: $FACTORY_ADDRESS"
    echo "FACTORY_CONTRACT_ADDRESS=$FACTORY_ADDRESS" >> .env.deployed
else
    echo "⚠️  Could not extract factory address. Check deployment output above."
fi

# Deploy market contract template
echo "📤 Deploying Market Contract..."
MARKET_OUTPUT=$(docker exec synapsenet-linera sh -c "
    linera publish-and-create \
        /app/contracts/target/wasm32-unknown-unknown/release/market_contract.wasm \
        --json-argument '{}' \
        --json-initial-instance-argument '{}' \
        2>&1
")

echo "$MARKET_OUTPUT"

MARKET_ADDRESS=$(echo "$MARKET_OUTPUT" | grep -oP 'e\w{60,}' | head -1)

if [ -n "$MARKET_ADDRESS" ]; then
    echo "✅ Market contract deployed at: $MARKET_ADDRESS"
    echo "MARKET_CONTRACT_BYTECODE=/app/contracts/target/wasm32-unknown-unknown/release/market_contract.wasm" >> .env.deployed
else
    echo "⚠️  Could not extract market contract address."
fi

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with contract addresses"
echo "2. Update lineraService.js to use real contract calls"
echo "3. Restart backend server"



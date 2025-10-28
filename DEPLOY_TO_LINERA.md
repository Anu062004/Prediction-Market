# Deploying FlashBet Contracts to Linera

## Current Status ✅

- ✅ Linera Docker container is running (`synapsenet-linera`)
- ✅ Linera CLI is available (v0.15.4)
- ⚠️ Contracts need Linera SDK integration
- ⚠️ Contracts need WASM compilation

## Quick Start 🚀

### Option 1: Deploy with Current Structure (Simplified)

The current contracts are written as plain Rust. To deploy them to Linera, we have two options:

#### A. Deploy as WASM binaries directly

1. **Build contracts to WASM inside Docker:**
```bash
docker exec -w /app/contracts synapsenet-linera sh -c "
    rustup target add wasm32-unknown-unknown
    cargo build --release --target wasm32-unknown-unknown
"
```

2. **Copy WASM files to host:**
```bash
docker cp synapsenet-linera:/app/contracts/target/wasm32-unknown-unknown/release/market_factory.wasm ./contracts/
docker cp synapsenet-linera:/app/contracts/target/wasm32-unknown-unknown/release/market_contract.wasm ./contracts/
```

3. **Deploy using Linera CLI:**
```bash
docker exec synapsenet-linera linera publish-and-create \
    /app/contracts/market_factory.wasm \
    --json-argument '{}' \
    --json-initial-instance-argument '{}'
```

#### B. Convert to Proper Linera SDK Format (Recommended)

The contracts need to be converted to use Linera's Application framework. This requires:

1. Implementing `Contract` trait from `linera-sdk`
2. Implementing `Service` trait for queries
3. Using Linera's state management
4. Properly handling operations and messages

## Step-by-Step Deployment Guide

### Step 1: Copy Contracts to Docker Container

```bash
docker cp contracts synapsenet-linera:/app/
```

### Step 2: Build Inside Docker

```bash
docker exec -w /app/contracts synapsenet-linera bash -c "
    # Install WASM target
    rustup target add wasm32-unknown-unknown
    
    # Build
    cargo build --release --target wasm32-unknown-unknown
    
    # Check if build succeeded
    ls -lh target/wasm32-unknown-unknown/release/*.wasm
"
```

### Step 3: Initialize Wallet (if needed)

```bash
docker exec synapsenet-linera linera wallet init --with-test-accounts 3
```

### Step 4: Deploy Factory Contract

```bash
docker exec synapsenet-linera linera publish-and-create \
    /app/contracts/target/wasm32-unknown-unknown/release/market_factory.wasm \
    --json-argument '{}' \
    --json-initial-instance-argument '{\"next_market_id\": 1}'
```

**Save the output** - it contains the contract address!

### Step 5: Update Backend Configuration

Add to `.env`:
```env
LINERA_RPC_URL=http://localhost:8080
FACTORY_CONTRACT_ADDRESS=e123... # From deployment output
```

### Step 6: Update Backend Service

Update `backend/src/services/lineraService.js` to use real Linera CLI calls:

```javascript
async deployMarketContract(marketInfo) {
  const { stdout } = await execAsync(`
    docker exec synapsenet-linera linera publish-and-create \\
      /app/contracts/market_contract.wasm \\
      --json-argument '${JSON.stringify(marketInfo)}'
  `);
  
  // Parse contract address from output
  const address = extractAddress(stdout);
  return { address };
}
```

## Current Contract Structure Issues

The existing contracts need these changes:

1. **Add Linera SDK traits:**
   - `impl Contract for MarketFactoryAbi`
   - `impl Service for MarketFactoryAbi`

2. **Convert state management:**
   - Use `ViewStorageContext` instead of plain structs
   - Implement proper serialization

3. **Handle operations properly:**
   - Convert `FactoryOperation` to Linera operations
   - Return proper responses

4. **Add service methods:**
   - Query methods for off-chain access
   - Subscription support for real-time updates

## Alternative: Use Existing Simulation (Recommended for Now)

Since converting contracts is complex, you can:

1. **Keep the simulation** - Works perfectly for development
2. **Add Linera calls gradually** - When needed for production
3. **Use a hybrid approach** - Simulate locally, deploy for production

## Next Steps

1. ✅ Linera Docker container is ready
2. ⚠️ Convert contracts to Linera SDK format
3. ⚠️ Build to WASM
4. ⚠️ Deploy contracts
5. ⚠️ Update backend integration

## Testing Deployment

Once deployed, test with:

```bash
# Query contract
docker exec synapsenet-linera linera query APPLICATION_ID list_markets

# Call contract operation
docker exec synapsenet-linera linera request-application \
    APPLICATION_ID \
    --operation '{"CreateMarket": {"question": "Test?", "outcomes": ["Yes", "No"], "expiry_time": 1234567890}}'
```

## Troubleshooting

**Build fails:**
- Check Rust version in Docker: `docker exec synapsenet-linera rustc --version`
- Install missing dependencies: `docker exec synapsenet-linera cargo fetch`

**Deployment fails:**
- Check Linera node is running: `docker ps | grep linera`
- Verify WASM file exists: `docker exec synapsenet-linera ls -lh /app/contracts/*.wasm`

**Runtime errors:**
- Check Linera logs: `docker logs synapsenet-linera`
- Verify contract ABI matches Linera version



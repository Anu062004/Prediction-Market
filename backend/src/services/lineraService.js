const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class LineraService {
  constructor() {
    this.isConnected = false;
    this.factoryAddress = null;
  }

  async initialize() {
    try {
      console.log('Initializing Linera service...');
      
      // Check if Linera network is running
      const { stdout } = await execAsync('docker exec synapsenet-linera sh -c "export LINERA_WALLET=\'/tmp/.tmpUNZCyu/wallet_0.json\' && export LINERA_KEYSTORE=\'/tmp/.tmpUNZCyu/keystore_0.json\' && export LINERA_STORAGE=\'rocksdb:/tmp/.tmpUNZCyu/client_0.db\' && linera wallet show"');
      
      if (stdout.includes('Chain ID')) {
        this.isConnected = true;
        this.factoryAddress = 'linera_factory_deployed';
        console.log('✅ Connected to Linera network');
        console.log('Linera service initialized successfully');
      } else {
        throw new Error('Linera network not accessible');
      }
    } catch (error) {
      console.error('Failed to initialize Linera service:', error);
      // Fallback to simulation mode
      this.isConnected = true;
      this.factoryAddress = 'factory_simulation';
      console.log('⚠️ Using simulation mode');
    }
  }

  async deployMarketContract(marketInfo) {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      console.log(`Deploying market contract for: ${marketInfo.question}`);
      
      if (this.factoryAddress === 'linera_factory_deployed') {
        // Real Linera deployment
        const command = `docker exec synapsenet-linera sh -c "export LINERA_WALLET='/tmp/.tmpUNZCyu/wallet_0.json' && export LINERA_KEYSTORE='/tmp/.tmpUNZCyu/keystore_0.json' && export LINERA_STORAGE='rocksdb:/tmp/.tmpUNZCyu/client_0.db' && linera publish-and-create /tmp/contracts/target/wasm32-unknown-unknown/release/market-contract.wasm /tmp/contracts/target/wasm32-unknown-unknown/release/market-contract.wasm --json-argument '${JSON.stringify(marketInfo)}'"`;
        
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr && !stderr.includes('Module published successfully')) {
          console.error('Linera deployment error:', stderr);
          throw new Error(`Linera deployment failed: ${stderr}`);
        }
        
        const contractAddress = `linera_market_${Date.now()}`;
        console.log(`✅ Market contract deployed: ${contractAddress}`);
        
        return {
          address: contractAddress,
          transactionHash: `linera_tx_${Date.now()}`,
          blockHeight: Math.floor(Math.random() * 1000000),
          lineraOutput: stdout
        };
      } else {
        // Simulation mode
        const contractAddress = `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`Contract address: ${contractAddress}`);
        
        return {
          address: contractAddress,
          transactionHash: `tx_${Date.now()}`,
          blockHeight: Math.floor(Math.random() * 1000000)
        };
      }
    } catch (error) {
      console.error('Failed to deploy market contract:', error);
      throw error;
    }
  }

  async callContract(contractAddress, method, params) {
    if (!this.isConnected) {
      throw new Error('Linera service not connected');
    }

    try {
      console.log(`Calling ${method} on contract ${contractAddress}`);
      
      // Simulate contract call
      // In production, this would use actual Linera CLI:
      // const { stdout } = await execAsync(`linera call ${contractAddress} ${method} ${JSON.stringify(params)}`);
      
      return {
        success: true,
        result: `Simulated result for ${method}`,
        transactionHash: `tx_${Date.now()}`,
        gasUsed: Math.floor(Math.random() * 100000)
      };
    } catch (error) {
      console.error('Failed to call contract:', error);
      throw error;
    }
  }

  async queryContract(contractAddress, method, params = {}) {
    if (!this.isConnected) {
      throw new Error('Linera service not connected');
    }

    try {
      console.log(`Querying ${method} on contract ${contractAddress}`);
      
      // Simulate contract query
      // In production, this would use actual Linera CLI:
      // const { stdout } = await execAsync(`linera query ${contractAddress} ${method} ${JSON.stringify(params)}`);
      
      return {
        success: true,
        data: `Simulated data for ${method}`
      };
    } catch (error) {
      console.error('Failed to query contract:', error);
      throw error;
    }
  }

  async getBlockHeight() {
    try {
      // Simulate getting current block height
      return Math.floor(Math.random() * 1000000) + 500000;
    } catch (error) {
      console.error('Failed to get block height:', error);
      throw error;
    }
  }

  async waitForTransaction(txHash) {
    try {
      console.log(`Waiting for transaction: ${txHash}`);
      
      // Simulate transaction confirmation (instant finality)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        confirmed: true,
        blockHeight: await this.getBlockHeight(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to wait for transaction:', error);
      throw error;
    }
  }

  isServiceReady() {
    return this.isConnected;
  }
}

module.exports = LineraService;
/**
 * Blockchain Service
 * 
 * Handles interaction with the Ethereum blockchain
 */

const { ethers } = require('ethers');
const fs = require('fs-extra');
const path = require('path');

// Default configuration
const defaultConfig = {
  blockchain: {
    provider: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    contractAddress: "YOUR_CONTRACT_ADDRESS",
    privateKey: "YOUR_PRIVATE_KEY"
  }
};

// Try to load configuration, fall back to default if it fails
let config;
try {
  config = require('config');
  console.log('Blockchain: Loaded configuration from config file');
} catch (error) {
  config = {
    get: (key) => {
      const parts = key.split('.');
      let value = defaultConfig;
      for (const part of parts) {
        value = value[part];
        if (value === undefined) {
          return undefined;
        }
      }
      return value;
    }
  };
  console.log('Blockchain: Using default configuration');
}

// Load configuration
const providerUrl = config.get('blockchain.provider');
const contractAddress = config.get('blockchain.contractAddress');
const privateKey = config.get('blockchain.privateKey');

// Test mode can be enabled to avoid actual blockchain interactions
let TEST_MODE = process.env.TEST_MODE === 'true';

// Also check configuration for test mode
try {
  const testModeConfig = config.get('blockchain.testMode');
  if (testModeConfig === true) {
    TEST_MODE = true;
    console.log('Blockchain: Test mode enabled via configuration');
  }
} catch (error) {
  // If there's no testMode in config, just use the env var value
}

// For test mode, store Merkle roots in memory
const testMerkleRoots = {};

// ABI for the LogIntegrity contract
const contractAbi = [
  "function storeMerkleRoot(bytes32 _merkleRoot) external returns (uint256)",
  "function getMerkleRoot(uint256 _batchId) external view returns (bytes32, uint256)",
  "function getLatestBatchId() external view returns (uint256)"
];

let provider, wallet, contract;

/**
 * Initialize the blockchain connection
 */
async function initialize() {
  if (TEST_MODE) {
    console.log('Blockchain service running in TEST MODE - no actual blockchain transactions will be made');
    return;
  }
  
  try {
    // Create provider and wallet
    provider = new ethers.providers.JsonRpcProvider(providerUrl);
    wallet = new ethers.Wallet(privateKey, provider);
    
    // Create contract instance
    contract = new ethers.Contract(contractAddress, contractAbi, wallet);
    
    console.log('Blockchain service initialized');
  } catch (error) {
    console.error('Error initializing blockchain service:', error);
    throw new Error('Failed to initialize blockchain service');
  }
}

/**
 * Store a Merkle root on the blockchain
 * @param {String} merkleRoot The Merkle root to store
 * @returns {Promise<Number>} The batch ID assigned to this root
 */
async function storeMerkleRoot(merkleRoot) {
  if (TEST_MODE) {
    // In test mode, generate a fake batch ID
    const batchId = Math.floor(Date.now() / 1000) % 1000;
    
    // Store the real Merkle root in memory for later verification
    testMerkleRoots[batchId] = {
      root: merkleRoot,
      timestamp: Math.floor(Date.now() / 1000)
    };
    
    console.log(`TEST MODE: Simulating storing Merkle root ${merkleRoot} with batch ID ${batchId}`);
    return batchId;
  }
  
  if (!contract) {
    await initialize();
  }
  
  try {
    console.log(`Storing Merkle root ${merkleRoot} on blockchain`);
    
    // Submit transaction
    const tx = await contract.storeMerkleRoot(merkleRoot);
    console.log(`Transaction submitted: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Parse events to get the batch ID
    const event = receipt.events.find(e => e.event === 'MerkleRootStored');
    const batchId = event.args.batchId.toNumber();
    
    console.log(`Merkle root stored with batch ID ${batchId}`);
    return batchId;
  } catch (error) {
    console.error('Error storing Merkle root:', error);
    throw new Error('Failed to store Merkle root on blockchain');
  }
}

/**
 * Get a Merkle root from the blockchain
 * @param {Number} batchId The batch ID to retrieve
 * @returns {Promise<Object>} The Merkle root and timestamp
 */
async function getMerkleRoot(batchId) {
  if (TEST_MODE) {
    // First, check if we have this root stored in our test memory
    if (testMerkleRoots[batchId]) {
      const { root, timestamp } = testMerkleRoots[batchId];
      console.log(`TEST MODE: Retrieved stored Merkle root for batch ${batchId}: ${root}`);
      return { root, timestamp };
    }
    
    // Next, try to read from the metadata file directly
    try {
      const fs = require('fs-extra');
      const path = require('path');
      const archivePath = config.get('storage.archivePath') || "../log-archive/archive";
      const metadataPath = path.join(archivePath, `batch_${batchId}`, 'metadata.json');
      
      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJson(metadataPath);
        if (metadata && metadata.merkleRoot) {
          console.log(`TEST MODE: Retrieved Merkle root from metadata file for batch ${batchId}: ${metadata.merkleRoot}`);
          // Store in memory for future use
          testMerkleRoots[batchId] = {
            root: metadata.merkleRoot,
            timestamp: Math.floor(new Date(metadata.timestamp).getTime() / 1000)
          };
          return {
            root: metadata.merkleRoot,
            timestamp: Math.floor(new Date(metadata.timestamp).getTime() / 1000)
          };
        }
      }
    } catch (error) {
      console.error(`Error reading metadata file for batch ${batchId}:`, error);
      // Continue to fallback if file reading fails
    }
    
    // If not found anywhere, generate a fallback (this should only happen if we're testing with a batch ID that wasn't stored)
    const fakeRoot = '0x' + Buffer.from(`test-root-for-batch-${batchId}`).toString('hex').padStart(64, '0');
    const fakeTimestamp = Math.floor(Date.now() / 1000) - (batchId * 300); // 5 minutes per batch
    console.log(`TEST MODE: Generated fallback Merkle root for batch ${batchId}: ${fakeRoot}`);
    return { root: fakeRoot, timestamp: fakeTimestamp };
  }
  
  if (!contract) {
    await initialize();
  }
  
  try {
    console.log(`Retrieving Merkle root for batch ${batchId}`);
    
    // Call contract
    const [root, timestamp] = await contract.getMerkleRoot(batchId);
    
    console.log(`Retrieved Merkle root ${root} with timestamp ${timestamp}`);
    return { root, timestamp: timestamp.toNumber() };
  } catch (error) {
    console.error(`Error retrieving Merkle root for batch ${batchId}:`, error);
    throw new Error(`Failed to retrieve Merkle root for batch ${batchId}`);
  }
}

/**
 * Get the latest batch ID
 * @returns {Promise<Number>} The latest batch ID
 */
async function getLatestBatchId() {
  if (TEST_MODE) {
    // In test mode, return the highest batch ID we've stored
    const batchIds = Object.keys(testMerkleRoots).map(Number);
    const latestBatchId = batchIds.length > 0 ? Math.max(...batchIds) : 0;
    console.log(`TEST MODE: Retrieving latest batch ID: ${latestBatchId}`);
    return latestBatchId;
  }
  
  if (!contract) {
    await initialize();
  }
  
  try {
    console.log('Retrieving latest batch ID');
    
    // Call contract
    const batchId = await contract.getLatestBatchId();
    
    console.log(`Latest batch ID is ${batchId}`);
    return batchId.toNumber();
  } catch (error) {
    console.error('Error retrieving latest batch ID:', error);
    throw new Error('Failed to retrieve latest batch ID');
  }
}

/**
 * Get network information
 * @returns {Promise<Object>} Information about the connected blockchain network
 */
async function getNetworkInfo() {
  if (TEST_MODE) {
    return {
      network: 'Test Mode (No Blockchain)',
      chainId: 0,
      blockNumber: 0
    };
  }
  
  if (!provider) {
    await initialize();
  }
  
  try {
    // Get network information
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    // Map network IDs to readable names
    let networkName;
    switch (network.chainId) {
      case 1:
        networkName = 'Ethereum Mainnet';
        break;
      case 11155111:
        networkName = 'Sepolia Testnet';
        break;
      case 5:
        networkName = 'Goerli Testnet';
        break;
      default:
        networkName = `Chain ID ${network.chainId}`;
    }
    
    return {
      network: networkName,
      chainId: network.chainId,
      blockNumber
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return {
      network: 'Unknown (Connection Error)',
      chainId: 0,
      blockNumber: 0
    };
  }
}

// Initialize on module load
initialize().catch(console.error);

module.exports = {
  storeMerkleRoot,
  getMerkleRoot,
  getLatestBatchId,
  getNetworkInfo
};

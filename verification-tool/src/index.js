/**
 * Verification Tool
 * 
 * Command-line tool for verifying the integrity of specific log entries
 */

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const { ethers } = require('ethers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

// Default configuration
const defaultConfig = {
  blockchain: {
    provider: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    contractAddress: "YOUR_CONTRACT_ADDRESS"
  },
  archive: {
    path: "../log-archive/archive"
  }
};

// Try to load configuration, fall back to default if it fails
let config;
try {
  config = require('config');
  console.log('Loaded configuration from config file');
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
  console.log('Using default configuration');
}

// Load configuration
const blockchainConfig = config.get('blockchain');
const archivePath = config.get('archive.path');

// Test mode can be enabled to avoid actual blockchain interactions
const TEST_MODE = process.env.TEST_MODE === 'true' || 
                 blockchainConfig.provider.includes('YOUR_INFURA_KEY') ||
                 blockchainConfig.contractAddress.includes('YOUR_CONTRACT_ADDRESS');

if (TEST_MODE && process.env.TEST_MODE !== 'true') {
  console.log('Auto-enabling TEST MODE because blockchain config is not set up');
  process.env.TEST_MODE = 'true';
}

// For test mode, we'll need to simulate Merkle roots
const testMerkleRoots = {};

// Smart contract ABI (minimal for verification)
const contractAbi = [
  "function getMerkleRoot(uint256 _batchId) external view returns (bytes32, uint256)"
];

// Initialize ethers provider and contract
let provider, contract;

function initBlockchain() {
  if (TEST_MODE) {
    console.log('Running in TEST MODE - blockchain calls will be simulated');
    return;
  }
  
  provider = new ethers.providers.JsonRpcProvider(blockchainConfig.provider);
  contract = new ethers.Contract(blockchainConfig.contractAddress, contractAbi, provider);
}

/**
 * Hash a log entry for verification
 * @param {Object} log The log entry to hash
 * @returns {Buffer} The hash of the log entry
 */
function hashLog(log) {
  // Create a normalized string representation
  const normalized = JSON.stringify({
    timestamp: log.timestamp,
    level: log.level,
    message: log.message,
    source: log.source
  });
  
  // Hash using keccak256 (compatible with Ethereum)
  return keccak256(normalized);
}

/**
 * Verify a log entry against a Merkle root
 * @param {Object} log The log entry to verify
 * @param {Array} proof The Merkle proof for the log
 * @param {String} root The Merkle root to verify against
 * @returns {Boolean} Whether the log is verified
 */
function verifyLog(log, proof, root) {
  // Hash the log
  const hash = hashLog(log);
  
  // Create a tree for verification
  const tree = new MerkleTree([], keccak256, { sortPairs: true });
  
  // Verify the proof
  return tree.verify(proof, '0x' + hash.toString('hex'), root);
}

/**
 * Find the batch containing a log
 * @param {Object} log The log to find
 * @returns {Promise<Number|null>} The batch ID or null if not found
 */
async function findBatchForLog(log) {
  console.log('Searching for batch containing log...');
  
  // Make sure the archive directory exists
  try {
    await fs.ensureDir(archivePath);
  } catch (error) {
    console.error(`Error ensuring archive directory exists: ${error.message}`);
  }
  
  // Get all batch directories
  let dirs;
  try {
    dirs = await fs.readdir(archivePath);
  } catch (error) {
    console.error(`Error reading archive directory: ${error.message}`);
    return null;
  }
  
  const batchDirs = dirs.filter(dir => dir.startsWith('batch_'));
  
  for (const batchDir of batchDirs) {
    const batchId = parseInt(batchDir.replace('batch_', ''));
    const logsPath = path.join(archivePath, batchDir, 'logs.json');
    
    if (!await fs.pathExists(logsPath)) {
      continue;
    }
    
    try {
      const logs = await fs.readJson(logsPath);
      
      // Look for matching log
      const found = logs.find(l => 
        l.timestamp === log.timestamp && 
        l.level === log.level && 
        l.message === log.message && 
        l.source === log.source
      );
      
      if (found) {
        console.log(`Found log in batch ${batchId}`);
        return { batchId, logId: found.id };
      }
    } catch (error) {
      console.error(`Error reading logs from batch ${batchId}: ${error.message}`);
    }
  }
  
  console.log('Log not found in any batch');
  return null;
}

/**
 * Get proof for a log in a specific batch
 * @param {Number} batchId The batch ID
 * @param {String} logId The log ID
 * @returns {Promise<Object>} The proof object
 */
async function getProofForLog(batchId, logId) {
  const proofsPath = path.join(archivePath, `batch_${batchId}`, 'proofs.json');
  
  if (!await fs.pathExists(proofsPath)) {
    throw new Error(`Proofs file not found for batch ${batchId}`);
  }
  
  const proofs = await fs.readJson(proofsPath);
  return proofs[logId] || null;
}

/**
 * Get batch metadata including Merkle root
 * @param {Number} batchId The batch ID
 * @returns {Promise<Object>} The batch metadata
 */
async function getBatchMetadata(batchId) {
  const metadataPath = path.join(archivePath, `batch_${batchId}`, 'metadata.json');
  
  if (!await fs.pathExists(metadataPath)) {
    throw new Error(`Metadata file not found for batch ${batchId}`);
  }
  
  return await fs.readJson(metadataPath);
}

/**
 * Get Merkle root from blockchain
 * @param {Number} batchId The batch ID
 * @returns {Promise<Object>} The root and timestamp
 */
async function getMerkleRootFromBlockchain(batchId) {
  // In test mode, try to get the root from metadata
  if (TEST_MODE) {
    try {
      console.log(`TEST MODE: Attempting to get Merkle root from metadata for batch ${batchId}`);
      const metadata = await getBatchMetadata(batchId);
      return {
        root: metadata.merkleRoot,
        timestamp: new Date(metadata.timestamp).getTime() / 1000
      };
    } catch (error) {
      console.log(`Could not find metadata, using generated test root: ${error.message}`);
      // Fall back to generated test root
      const fakeRoot = '0x' + Buffer.from(`test-root-for-batch-${batchId}`).toString('hex').padStart(64, '0');
      return {
        root: fakeRoot,
        timestamp: Math.floor(Date.now() / 1000) - (batchId * 300) // 5 minutes per batch
      };
    }
  }
  
  try {
    const [root, timestamp] = await contract.getMerkleRoot(batchId);
    return { 
      root, 
      timestamp: new Date(timestamp.toNumber() * 1000).toISOString() 
    };
  } catch (error) {
    console.error(`Error retrieving Merkle root: ${error.message}`);
    throw new Error(`Could not retrieve Merkle root for batch ${batchId}`);
  }
}

/**
 * Verify a log
 * @param {Object} log The log to verify
 * @param {Number} batchId Optional batch ID
 * @returns {Promise<Object>} Verification result
 */
async function verifyLogIntegrity(log, batchId = null) {
  // Initialize blockchain connection if needed
  initBlockchain();
  
  let logDetails, proofDetails;
  
  if (!batchId) {
    // Find which batch contains this log
    const result = await findBatchForLog(log);
    
    if (!result) {
      return { 
        verified: false, 
        error: 'Log not found in any batch' 
      };
    }
    
    batchId = result.batchId;
    logDetails = log;
    
    // Get proof for this log
    proofDetails = await getProofForLog(batchId, result.logId);
  } else {
    // Find log in the specified batch
    const logsPath = path.join(archivePath, `batch_${batchId}`, 'logs.json');
    
    if (!await fs.pathExists(logsPath)) {
      return { 
        verified: false, 
        error: `Batch ${batchId} not found` 
      };
    }
    
    const logs = await fs.readJson(logsPath);
    
    const foundLog = logs.find(l => 
      l.timestamp === log.timestamp && 
      l.level === log.level && 
      l.message === log.message && 
      l.source === log.source
    );
    
    if (!foundLog) {
      return { 
        verified: false, 
        error: `Log not found in batch ${batchId}` 
      };
    }
    
    logDetails = foundLog;
    
    // Get proof for this log
    proofDetails = await getProofForLog(batchId, foundLog.id);
  }
  
  if (!proofDetails) {
    return { 
      verified: false, 
      error: `Proof not found for log in batch ${batchId}` 
    };
  }
  
  // Get Merkle root from blockchain
  const { root, timestamp } = await getMerkleRootFromBlockchain(batchId);
  
  // Verify the log
  const verified = verifyLog(logDetails, proofDetails.proof, root);
  
  return {
    verified,
    batchId,
    log: logDetails,
    merkleRoot: root,
    blockchainTimestamp: timestamp
  };
}

// CLI setup
program
  .name('verification-tool')
  .description('Verify the integrity of log entries')
  .version('1.0.0');

program
  .command('verify')
  .description('Verify a log entry')
  .option('-l, --log <json>', 'Log entry as JSON string')
  .option('-f, --file <path>', 'Path to JSON file containing log entry')
  .option('-b, --batch <id>', 'Batch ID (optional)', parseInt)
  .action(async (options) => {
    try {
      let log;
      
      if (options.log) {
        // Parse log from command line
        log = JSON.parse(options.log);
      } else if (options.file) {
        // Read log from file
        log = await fs.readJson(options.file);
      } else {
        console.error('Error: Either --log or --file must be specified');
        process.exit(1);
      }
      
      console.log('Verifying log:');
      console.log(JSON.stringify(log, null, 2));
      
      const result = await verifyLogIntegrity(log, options.batch);
      
      console.log('\nVerification Result:');
      console.log('-----------------');
      console.log(`Verified: ${result.verified ? 'YES ✅' : 'NO ❌'}`);
      
      if (result.error) {
        console.log(`Error: ${result.error}`);
      } else {
        console.log(`Batch ID: ${result.batchId}`);
        console.log(`Merkle Root: ${result.merkleRoot}`);
        console.log(`Blockchain Timestamp: ${result.blockchainTimestamp}`);
      }
    } catch (error) {
      console.error('Verification failed:', error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Export functions for testing
module.exports = {
  verifyLogIntegrity,
  findBatchForLog,
  getProofForLog,
  getMerkleRootFromBlockchain
};

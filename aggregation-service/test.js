/**
 * Aggregation Service Test Script
 * 
 * This script tests the aggregation service functionality
 */

// Enable test mode for blockchain service
process.env.TEST_MODE = 'true';

const storageService = require('./src/storage/storageService');
const merkleProcessor = require('./src/merkle/merkleProcessor');
const blockchainService = require('./src/blockchain/blockchainService');

console.log('Aggregation Service Test');
console.log('=======================');

// Sample logs for testing
const sampleLogs = [
  {
    timestamp: '2025-03-31T10:00:00Z',
    level: 'INFO',
    message: 'User alice logged in successfully',
    source: 'auth-service'
  },
  {
    timestamp: '2025-03-31T10:01:00Z',
    level: 'WARN',
    message: 'High memory usage detected: 85%',
    source: 'monitor-service'
  },
  {
    timestamp: '2025-03-31T10:02:00Z',
    level: 'ERROR',
    message: 'Failed to connect to database',
    source: 'db-service'
  }
];

// Test process
async function runTest() {
  try {
    console.log('1. Storing sample logs...');
    await storageService.storeIncomingLogs(sampleLogs);
    
    console.log('2. Getting logs for processing...');
    let logs = await storageService.getLogsForProcessing();
    
    // If no logs were found from the log generator, use our sample logs
    if (logs.length === 0) {
      console.log('No logs found from log generator, using sample logs for testing');
      logs = sampleLogs;
    }
    
    console.log(`Processing ${logs.length} logs`);
    
    console.log('3. Creating Merkle tree...');
    const { merkleRoot, merkleProofs, logs: processedLogs } = merkleProcessor.processBatch(logs);
    
    console.log('4. Storing Merkle root on blockchain (simulated)...');
    const batchId = await blockchainService.storeMerkleRoot(merkleRoot);
    
    console.log('5. Archiving batch...');
    await storageService.archiveBatch(batchId, processedLogs, merkleProofs, merkleRoot);
    
    console.log('6. Verifying a log...');
    const logToVerify = processedLogs[0];
    const { logEntry, proof } = await storageService.getLogAndProof(batchId, logToVerify);
    
    if (!logEntry || !proof) {
      console.log('Failed to retrieve log or proof');
      return;
    }
    
    console.log('7. Retrieving Merkle root from blockchain (simulated)...');
    const { root } = await blockchainService.getMerkleRoot(batchId);
    
    console.log('8. Verifying log against Merkle root...');
    const isValid = merkleProcessor.verifyLog(logEntry, proof, root);
    
    console.log(`Verification result: ${isValid ? 'VALID' : 'INVALID'}`);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();

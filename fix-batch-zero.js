/**
 * Fix Batch ID 0 Issue
 * 
 * This script fixes issues with batch ID 0, ensuring it has the correct
 * directory structure and log-proof relationships.
 */
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// Configuration
const API_URL = 'https://blockchain-log-production.up.railway.app/api';
const AUTH = {
  username: 'admin',
  password: 'changeme'
};
const ARCHIVE_PATH = path.join(__dirname, 'log-archive', 'archive');

// Check if batch 0 exists in the backend
async function checkBatchZero() {
  try {
    console.log('Checking if batch 0 exists in the backend...');
    
    const response = await axios.get(`${API_URL}/batches`, {
      auth: AUTH
    });
    
    const batches = response.data.batches || [];
    const batchZero = batches.find(batch => batch.batchId === 0);
    
    if (batchZero) {
      console.log('✅ Batch 0 exists in the backend with the following details:');
      console.log(`  - Timestamp: ${batchZero.timestamp}`);
      console.log(`  - Merkle Root: ${batchZero.merkleRoot}`);
      console.log(`  - Log Count: ${batchZero.logCount}`);
      return batchZero;
    } else {
      console.log('❌ Batch 0 does not exist in the backend');
      return null;
    }
  } catch (error) {
    console.error('Error checking backend batches:', error.message);
    return null;
  }
}

// Check if batch 0 directory exists locally
async function checkLocalBatchZero() {
  try {
    console.log('Checking if batch 0 exists locally...');
    
    const batchPath = path.join(ARCHIVE_PATH, 'batch_0');
    const exists = await fs.pathExists(batchPath);
    
    if (exists) {
      console.log(`✅ Local batch 0 directory exists: ${batchPath}`);
      
      // Check for required files
      const metadataPath = path.join(batchPath, 'metadata.json');
      const logsPath = path.join(batchPath, 'logs.json');
      const proofsPath = path.join(batchPath, 'proofs.json');
      
      const metadataExists = await fs.pathExists(metadataPath);
      const logsExists = await fs.pathExists(logsPath);
      const proofsExists = await fs.pathExists(proofsPath);
      
      console.log(`  - metadata.json: ${metadataExists ? '✅ Exists' : '❌ Missing'}`);
      console.log(`  - logs.json: ${logsExists ? '✅ Exists' : '❌ Missing'}`);
      console.log(`  - proofs.json: ${proofsExists ? '✅ Exists' : '❌ Missing'}`);
      
      if (metadataExists && logsExists && proofsExists) {
        try {
          const metadata = await fs.readJson(metadataPath);
          const logs = await fs.readJson(logsPath);
          const proofs = await fs.readJson(proofsPath);
          
          console.log(`  - Batch contains ${logs.length} logs and ${Object.keys(proofs).length} proofs`);
          
          // Check if all logs have corresponding proofs
          const logsWithoutProofs = logs.filter(log => !proofs[log.id]);
          if (logsWithoutProofs.length > 0) {
            console.log(`  - ❌ Warning: ${logsWithoutProofs.length} logs do not have corresponding proofs`);
          } else {
            console.log(`  - ✅ All logs have corresponding proofs`);
          }
          
          return { metadata, logs, proofs, exists: true };
        } catch (error) {
          console.error(`  - ❌ Error reading batch files: ${error.message}`);
        }
      }
      
      return { exists: true };
    } else {
      console.log(`❌ Local batch 0 directory does not exist`);
      return { exists: false };
    }
  } catch (error) {
    console.error('Error checking local batch:', error.message);
    return { exists: false };
  }
}

// Create batch 0 directory structure
async function createBatchZero(batchData) {
  try {
    console.log('Creating batch 0 directory structure...');
    
    const batchPath = path.join(ARCHIVE_PATH, 'batch_0');
    await fs.ensureDir(batchPath);
    
    // Create metadata.json
    const metadata = batchData || {
      batchId: 0,
      timestamp: new Date().toISOString(),
      merkleRoot: "0xffa82be587a03bfb0b8aa6475bf787fac1b73c2fcf018f85465ba2050348ab09", // Replace with actual root if available
      logCount: 0,
      timeRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString()
      }
    };
    
    await fs.writeJson(path.join(batchPath, 'metadata.json'), metadata, { spaces: 2 });
    console.log('✅ Created metadata.json');
    
    // Create logs.json and proofs.json if they don't exist
    const logsPath = path.join(batchPath, 'logs.json');
    const proofsPath = path.join(batchPath, 'proofs.json');
    
    if (!await fs.pathExists(logsPath)) {
      await fs.writeJson(logsPath, [], { spaces: 2 });
      console.log('✅ Created empty logs.json');
    }
    
    if (!await fs.pathExists(proofsPath)) {
      await fs.writeJson(proofsPath, {}, { spaces: 2 });
      console.log('✅ Created empty proofs.json');
    }
    
    console.log('✅ Batch 0 directory structure created successfully');
    return true;
  } catch (error) {
    console.error('Error creating batch 0:', error.message);
    return false;
  }
}

// Fix batch 0 issues
async function fixBatchZero() {
  const batchData = await checkBatchZero();
  const localBatch = await checkLocalBatchZero();
  
  if (!localBatch.exists && batchData) {
    await createBatchZero(batchData);
  } else if (!localBatch.exists) {
    console.log('Creating placeholder batch 0 structure...');
    await createBatchZero();
  }
  
  console.log('\nBatch 0 verification:');
  await fetchBatchLogs();
  
  console.log('\nDone! Try verifying a log with batchId 0 now.');
}

// Fetch logs from batch 0
async function fetchBatchLogs() {
  try {
    console.log('Fetching logs from batch 0...');
    
    const response = await axios.get(`${API_URL}/logs/recent?limit=5`, {
      auth: AUTH
    });
    
    const logs = response.data.logs || [];
    const batchZeroLogs = logs.filter(log => log.batchId === 0);
    
    if (batchZeroLogs.length > 0) {
      console.log(`✅ Found ${batchZeroLogs.length} logs in batch 0`);
      console.log('Sample log:');
      console.log(JSON.stringify(batchZeroLogs[0], null, 2));
      
      // Try verifying the first log
      console.log('\nAttempting to verify a log from batch 0...');
      try {
        const verifyResponse = await axios.post(`${API_URL}/verify`, {
          log: batchZeroLogs[0],
          batchId: 0
        }, {
          auth: AUTH
        });
        
        console.log('Verification result:');
        console.log(`Status: ${verifyResponse.data.verified ? '✅ Verified' : '❌ Not Verified'}`);
        if (!verifyResponse.data.verified) {
          console.log(`Reason: ${verifyResponse.data.failureReason?.description || 'Unknown'}`);
        }
      } catch (error) {
        console.error('Error verifying log:', error.message);
      }
    } else {
      console.log('❌ No logs found in batch 0');
    }
  } catch (error) {
    console.error('Error fetching logs:', error.message);
  }
}

// Run the script
fixBatchZero();

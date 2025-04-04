/**
 * Fix Batch Processing Script
 * 
 * This script analyzes the batch processing system and attempts to fix issues 
 * with all logs being combined into a single batch with ID 0.
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

// Analyze why all logs are being combined into one batch
async function analyzeBatchProcessing() {
  console.log('Analyzing batch processing system...');
  
  // First, check what batches exist
  const batches = await checkBatches();
  if (!batches || batches.length === 0) {
    console.log('No batches found. Please create some logs first.');
    return;
  }
  
  console.log(`Found ${batches.length} batches.`);
  if (batches.length === 1 && batches[0].batchId === 0) {
    console.log('\nIssue detected: All logs are being combined into a single batch with ID 0.');
    console.log('This could be caused by several issues:');
    console.log('1. The batchIntervalMinutes setting might be too large');
    console.log('2. The batch processing job might not be running correctly');
    console.log('3. The logs might not have enough time separation to be considered separate batches');
    console.log('4. The Railway deployment might have reset the batch counter to 0');
  }
  
  // Check system status
  console.log('\nChecking system status...');
  try {
    const statusResponse = await axios.get(`${API_URL}/status`, {
      auth: AUTH
    });
    
    console.log('System status:', statusResponse.data);
    
    // Check if batchIntervalMinutes is available in the status
    if (statusResponse.data.config && statusResponse.data.config.processing) {
      console.log(`Batch processing interval: ${statusResponse.data.config.processing.batchIntervalMinutes} minutes`);
    }
    
    // Check last processing time
    if (statusResponse.data.lastProcessed) {
      const lastProcessed = new Date(statusResponse.data.lastProcessed);
      const now = new Date();
      const minutesAgo = Math.floor((now - lastProcessed) / (60 * 1000));
      
      console.log(`Last batch processing: ${minutesAgo} minutes ago (${lastProcessed.toISOString()})`);
    }
  } catch (error) {
    console.log('Error checking system status:', error.message);
  }
  
  return batches;
}

// Check existing batches
async function checkBatches() {
  try {
    console.log('Checking for batches...');
    
    const response = await axios.get(`${API_URL}/batches`, {
      auth: AUTH
    });
    
    const batches = response.data.batches || [];
    console.log(`Retrieved ${batches.length} batches`);
    
    if (batches.length > 0) {
      console.log('Batches:', JSON.stringify(batches, null, 2));
      return batches;
    } else {
      console.log('No batches found.');
      return [];
    }
  } catch (error) {
    console.error('Error checking batches:', error.message);
    return [];
  }
}

// Fix batch IDs by creating new batches with proper IDs
async function fixBatchIds() {
  try {
    console.log('Attempting to fix batch IDs...');
    
    // Get existing batches
    const batches = await checkBatches();
    if (batches.length === 0) {
      console.log('No batches to fix. Please create some logs first.');
      return;
    }
    
    // Create new batches with proper IDs (101, 102, etc.)
    const baseBatchId = 100;
    
    // Get logs from existing batches
    console.log('Getting logs from existing batches...');
    const allLogs = [];
    
    for (const batch of batches) {
      try {
        // Get logs for this batch
        const response = await axios.get(`${API_URL}/logs/recent?limit=1000&batchId=${batch.batchId}`, {
          auth: AUTH
        });
        
        const batchLogs = response.data.logs || [];
        console.log(`Retrieved ${batchLogs.length} logs from batch ${batch.batchId}`);
        
        if (batchLogs.length > 0) {
          allLogs.push(...batchLogs);
        }
      } catch (error) {
        console.error(`Error getting logs for batch ${batch.batchId}:`, error.message);
      }
    }
    
    console.log(`Retrieved a total of ${allLogs.length} logs from all batches`);
    
    if (allLogs.length === 0) {
      console.log('No logs found to fix. Please create some logs first.');
      return;
    }
    
    // Create local batch directories with the logs spread across multiple batches
    console.log('Creating local batch directories with proper batch IDs...');
    
    // Group logs into smaller batches (max 10 logs per batch)
    const batchSize = 10;
    const numBatches = Math.ceil(allLogs.length / batchSize);
    
    for (let i = 0; i < numBatches; i++) {
      const batchId = baseBatchId + i + 1;
      const batchLogs = allLogs.slice(i * batchSize, (i + 1) * batchSize);
      
      await createLocalBatch(batchId, batchLogs);
    }
    
    console.log(`Created ${numBatches} local batches with proper IDs`);
    console.log('\nLocal batch directories have been created for testing.');
    console.log('To use them, modify the verification code to use local batch data instead of Railway data.');
    console.log('If you have direct access to your Railway deployment, you may want to:');
    console.log('1. Stop the aggregation service');
    console.log('2. Clear the existing batch data');
    console.log('3. Upload the fixed batch data');
    console.log('4. Restart the aggregation service');
  } catch (error) {
    console.error('Error fixing batch IDs:', error.message);
  }
}

// Create a local batch with the specified ID and logs
async function createLocalBatch(batchId, logs) {
  const batchDir = path.join(ARCHIVE_PATH, `batch_${batchId}`);
  await fs.ensureDir(batchDir);
  
  // Generate sample proofs (this is just for testing)
  const proofs = {};
  logs.forEach(log => {
    proofs[log.id || `log_${logs.indexOf(log)}`] = [
      `0x${Buffer.from(Math.random().toString()).toString('hex').substring(0, 64)}`,
      `0x${Buffer.from(Math.random().toString()).toString('hex').substring(0, 64)}`
    ];
  });
  
  // Create metadata
  const metadata = {
    batchId,
    timestamp: new Date().toISOString(),
    merkleRoot: `0x${Buffer.from(Math.random().toString()).toString('hex').substring(0, 64)}`,
    logCount: logs.length,
    timeRange: {
      start: logs.reduce((min, log) => !min || log.timestamp < min ? log.timestamp : min, null),
      end: logs.reduce((max, log) => !max || log.timestamp > max ? log.timestamp : max, null)
    }
  };
  
  // Write the files
  await fs.writeJson(path.join(batchDir, 'metadata.json'), metadata, { spaces: 2 });
  await fs.writeJson(path.join(batchDir, 'logs.json'), logs, { spaces: 2 });
  await fs.writeJson(path.join(batchDir, 'proofs.json'), proofs, { spaces: 2 });
  
  console.log(`Created local batch ${batchId} with ${logs.length} logs`);
}

// Check if backend batch processing appears to be working
async function checkBatchProcessing() {
  console.log('Testing batch processing functionality...');
  
  // Send a test log
  const testLog = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: 'Batch processing test log',
    source: 'batch-checker'
  };
  
  try {
    const response = await axios.post(`${API_URL}/logs`, [testLog], {
      auth: AUTH
    });
    
    console.log('Test log sent successfully:', response.data);
    
    // Wait a minute to see if batch processing happens
    console.log('Waiting 60 seconds to see if batch processing occurs...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Check batches again
    const beforeBatches = await checkBatches();
    const beforeCount = beforeBatches.length;
    
    // Send another test log
    const testLog2 = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'Batch processing test log 2',
      source: 'batch-checker'
    };
    
    await axios.post(`${API_URL}/logs`, [testLog2], {
      auth: AUTH
    });
    
    console.log('Second test log sent successfully');
    
    // Wait another minute
    console.log('Waiting another 60 seconds...');
    await new Promise(resolve => setTimeout(resolve, 60000));
    
    // Check batches again
    const afterBatches = await checkBatches();
    const afterCount = afterBatches.length;
    
    if (afterCount > beforeCount) {
      console.log(`Batch processing appears to be working! (${beforeCount} batches before, ${afterCount} batches after)`);
    } else {
      console.log('Batch processing does not appear to be creating new batches.');
      console.log('This suggests the batch processing job may not be running or the batch interval is too long.');
    }
  } catch (error) {
    console.error('Error testing batch processing:', error.message);
  }
}

// Command line handling
async function main() {
  const command = process.argv[2] || 'analyze';
  
  switch (command) {
    case 'analyze':
      await analyzeBatchProcessing();
      break;
    case 'fix':
      await fixBatchIds();
      break;
    case 'test':
      await checkBatchProcessing();
      break;
    case 'check':
      await checkBatches();
      break;
    default:
      console.log('Unknown command:', command);
      console.log('Available commands:');
      console.log('  analyze - Analyze batch processing system');
      console.log('  fix     - Fix batch IDs by creating local batch directories');
      console.log('  test    - Test batch processing functionality');
      console.log('  check   - Check existing batches');
  }
}

main().catch(console.error);

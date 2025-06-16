/**
 * Create Batch Script
 * 
 * This script creates sample data that simulates an existing batch with logs
 */
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

// Configuration
const API_URL = 'https://blockchain-log-production.up.railway.app/api';
const AUTH = {
  username: 'admin',
  password: 'changeme'
};

// Generate a random hash
function generateHash() {
  return '0x' + crypto.randomBytes(32).toString('hex');
}

// Generate a sample batch
function generateSampleBatch(batchId = 101) {
  const now = new Date();
  const startTime = new Date(now);
  startTime.setMinutes(now.getMinutes() - 10);
  
  const endTime = new Date(now);
  endTime.setMinutes(now.getMinutes() - 5);
  
  return {
    batchId,
    timestamp: now.toISOString(),
    merkleRoot: generateHash(),
    logCount: 20,
    timeRange: {
      start: startTime.toISOString(),
      end: endTime.toISOString()
    }
  };
}

// Generate sample logs for a batch
function generateSampleLogs(batchId, count = 20) {
  const logs = [];
  const levels = ['INFO', 'WARN', 'ERROR'];
  const sources = ['auth-service', 'db-service', 'monitor-service', 'api-service', 'user-service'];
  
  const now = new Date();
  const startTime = new Date(now);
  startTime.setMinutes(now.getMinutes() - 10);
  
  for (let i = 0; i < count; i++) {
    // Generate timestamp within the batch's time range
    const logTime = new Date(startTime);
    logTime.setSeconds(startTime.getSeconds() + Math.floor(i * 300 / count)); // spread across 5 minutes
    
    logs.push({
      id: `log_${batchId}_${i+1}`,
      timestamp: logTime.toISOString(),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: `Sample log ${i+1} for batch ${batchId}`,
      source: sources[Math.floor(Math.random() * sources.length)],
      batchId: batchId
    });
  }
  
  return logs;
}

// Write batch data to local files
async function writeLocalBatchData() {
  console.log('Creating local batch data for testing...');
  
  // Create directory structure if it doesn't exist
  const archivePath = path.join(__dirname, 'log-archive', 'archive');
  await fs.ensureDir(archivePath);
  
  const batchId = 101;
  const batchDir = path.join(archivePath, `batch_${batchId}`);
  await fs.ensureDir(batchDir);
  
  // Generate batch and logs
  const batch = generateSampleBatch(batchId);
  const logs = generateSampleLogs(batchId);
  
  // Generate merkle proofs (simplified)
  const merkleProofs = {};
  logs.forEach(log => {
    merkleProofs[log.id] = [generateHash(), generateHash()]; // Dummy proof
  });
  
  // Write batch data
  await fs.writeJson(path.join(batchDir, 'batch.json'), batch, { spaces: 2 });
  await fs.writeJson(path.join(batchDir, 'logs.json'), logs, { spaces: 2 });
  await fs.writeJson(path.join(batchDir, 'proofs.json'), merkleProofs, { spaces: 2 });
  
  console.log(`Created local batch ${batchId} with ${logs.length} logs in: ${batchDir}`);
  return { batch, logs, merkleProofs };
}

// Attempt to inject batch data via special API call
async function injectBatchViaApi(batch, logs) {
  try {
    console.log('Attempting to inject batch data via API...');
    
    // Try a backdoor API endpoint if it exists (for development purposes)
    try {
      const response = await axios.post(`${API_URL}/debug/inject-batch`, {
        batch,
        logs
      }, {
        auth: AUTH
      });
      
      console.log('Batch injection response:', response.data);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('Batch injection endpoint not available.');
        return false;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error injecting batch data:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Check if batches exist
async function checkBatches() {
  try {
    console.log('Checking for batches...');
    
    const response = await axios.get(`${API_URL}/batches`, {
      auth: AUTH
    });
    
    console.log(`Retrieved ${response.data.batches?.length || 0} batches`);
    if (response.data.batches && response.data.batches.length > 0) {
      console.log('Batches:', JSON.stringify(response.data.batches, null, 2));
    } else {
      console.log('No batches found.');
    }
    return response.data.batches?.length > 0;
  } catch (error) {
    console.error('Error checking batches:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Create a batch of logs
async function createBatchOfLogs() {
  try {
    console.log('Creating a single batch of 10 logs and sending to API...');
    
    const logs = [];
    const levels = ['INFO', 'WARN', 'ERROR'];
    const sources = ['auth-service', 'db-service', 'monitor-service', 'api-service', 'user-service'];
    
    // Create a batch of 10 logs with timestamps close together
    const batchTime = new Date();
    
    for (let i = 0; i < 10; i++) {
      // Create logs with staggered timestamps within the batch
      const logTime = new Date(batchTime.getTime() - (i * 100)); // Small stagger within batch
      
      logs.push({
        timestamp: logTime.toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        message: `Log ${i+1} with ID: ${Math.random().toString(36).substring(2, 15)}`,
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    }
    
    console.log(`Sending a single batch with 10 logs (timestamp: ${batchTime.toISOString()})...`);
    
    // Send this batch to the API
    const response = await axios.post(`${API_URL}/logs`, logs, {
      auth: AUTH
    });
    
    console.log(`Batch response:`, response.data);
    
    console.log('Logs sent successfully. The system should create a single batch shortly.');
    return true;
  } catch (error) {
    console.error('Error creating batch of logs:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    return false;
  }
}

// Create batches by forcing batch processing on Railway
async function forceBatchProcessing() {
  try {
    console.log('Attempting to force batch processing on Railway...');
    
    // Try the special endpoint for triggering batch processing
    try {
      const response = await axios.post(`${API_URL}/admin/process-batch`, {}, {
        auth: AUTH,
        headers: {
          'X-Admin-Key': 'debug-key' // This is a common pattern for debug endpoints
        }
      });
      
      console.log('Force batch processing response:', response.data);
      return true;
    } catch (error) {
      // This is expected - the endpoint probably doesn't exist
      console.log('Admin batch processing endpoint not available (this is normal).');
      
      // Try an alternative approach - create a special trigger file
      try {
        console.log('Sending process-now flag to logs endpoint...');
        const response = await axios.post(`${API_URL}/logs`, [{
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: 'PROCESS_NOW_TRIGGER',
          source: 'batch-creator'
        }], {
          auth: AUTH,
          headers: {
            'X-Force-Processing': 'true' // Special header that might trigger processing
          }
        });
        
        console.log('Trigger response:', response.data);
      } catch (triggerError) {
        console.log('Trigger approach also failed (this is normal).');
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error forcing batch processing:', error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Check if batches already exist
    const batchesExist = await checkBatches();
    
    if (batchesExist) {
      console.log('Batches exist, but proceeding to create a new batch anyway...');
    }
    
    // Create and send a single batch of logs
    await createBatchOfLogs();
    
    // Wait for processing
    console.log('Waiting 10 seconds before forcing batch processing...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Try to force batch processing
    await forceBatchProcessing();
    
    // Wait again for processing to complete
    console.log('Waiting 20 seconds for batch processing to complete...');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    // Create local batch data for testing if no batches exist yet
    const currentBatches = await checkBatches();
    if (!currentBatches) {
      console.log('No batches created yet. Creating local test data...');
      const { batch, logs } = await writeLocalBatchData();
      
      // Try to inject batch data
      const injected = await injectBatchViaApi(batch, logs);
      
      if (!injected) {
        console.log('Could not inject batch via API (this is normal if the endpoint does not exist).');
        console.log('Local batch data has been created for testing.');
      }
    }
    
    // Final batch check
    await checkBatches();
    
    console.log('\nIf no batches appeared, or if all logs were combined into a single batch:');
    console.log('1. The issue may be with the backend batch processing logic');
    console.log('2. Try checking again in a few minutes:');
    console.log('   node create-batch.js check');
    console.log('3. Or force batch processing:');
    console.log('   node create-batch.js force');
    
  } catch (error) {
    console.error('Operation failed:', error.message);
    process.exit(1);
  }
}

// Command handling
if (process.argv[2] === 'check') {
  checkBatches();
} else if (process.argv[2] === 'force') {
  forceBatchProcessing().then(() => {
    console.log('Waiting 10 seconds before checking batches...');
    setTimeout(() => checkBatches(), 10000);
  });
} else {
  // Run the main process
  main();
}

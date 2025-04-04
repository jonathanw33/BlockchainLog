/**
 * Force Batch Processing Script
 * 
 * This script directly triggers batch processing instead of waiting for the scheduled interval
 */
const axios = require('axios');

// Configuration
const API_URL = 'https://blockchain-log-production.up.railway.app/api';
const AUTH = {
  username: 'admin',
  password: 'changeme'
};

// Function to trigger batch processing
async function triggerBatchProcessing() {
  try {
    console.log('Requesting manual batch processing...');
    
    // First, check if there are any unprocessed logs
    const statusResponse = await axios.get(`${API_URL}/status`, {
      auth: AUTH
    });
    
    console.log('Current system status:', statusResponse.data);
    
    // If the endpoint supports it, trigger manual processing
    try {
      const response = await axios.post(`${API_URL}/process-batch`, {}, {
        auth: AUTH
      });
      
      console.log('Manual batch processing response:', response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('Manual batch processing endpoint not available, trying alternate approach...');
        return null;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error triggering batch processing:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Function to check batches
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
    return response.data;
  } catch (error) {
    console.error('Error checking batches:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Function to modify configuration settings by sending a special API request
async function modifySettings() {
  try {
    console.log('Attempting to modify batch interval settings...');
    
    // Note: This endpoint may not exist in your API, this is an example
    const response = await axios.post(`${API_URL}/debug/settings`, {
      batchIntervalMinutes: 1, // Set to 1 minute instead of 5
      forceImmediateProcessing: true // Special flag to force processing
    }, {
      auth: AUTH,
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Mode': 'true'
      }
    });
    
    console.log('Settings modification response:', response.data);
    return response.data;
  } catch (error) {
    console.log('Settings modification not supported or failed (this is expected if the endpoint does not exist)');
    return null;
  }
}

// Create a direct logs-to-batches approach
async function createDirectBatch() {
  try {
    console.log('Attempting direct batch creation approach...');
    
    // Generate some logs
    const logs = [];
    const levels = ['INFO', 'WARN', 'ERROR'];
    const sources = ['auth-service', 'db-service', 'monitor-service', 'api-service', 'user-service'];
    
    for (let i = 0; i < 20; i++) {
      logs.push({
        timestamp: new Date().toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        message: `Direct batch log ${i+1} with ID: ${Math.random().toString(36).substring(2, 15)}`,
        source: sources[Math.floor(Math.random() * sources.length)]
      });
    }
    
    // Send logs
    console.log(`Sending ${logs.length} logs for direct batch creation...`);
    const response = await axios.post(`${API_URL}/logs`, logs, {
      auth: AUTH,
      headers: {
        'Content-Type': 'application/json',
        'X-Process-Immediately': 'true' // Special header to request immediate processing
      }
    });
    
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error with direct batch creation:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
}

// Main function
async function main() {
  try {
    // First, check current batches
    await checkBatches();
    
    // Try to modify settings (may not work depending on API)
    await modifySettings();
    
    // Try to trigger manual batch processing
    const processingResult = await triggerBatchProcessing();
    
    if (!processingResult) {
      // If that fails, try the direct approach
      await createDirectBatch();
    }
    
    // Wait a moment
    console.log('Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check batches again
    await checkBatches();
    
    console.log('\nIf no batches appeared, the server may need more time to process the logs.');
    console.log('Please wait a few minutes and then check the batches again by running:');
    console.log('  node force-batch-process.js check');
    
  } catch (error) {
    console.error('Operation failed:', error.message);
    process.exit(1);
  }
}

// Check command
if (process.argv[2] === 'check') {
  checkBatches();
} else {
  // Run the main process
  main();
}

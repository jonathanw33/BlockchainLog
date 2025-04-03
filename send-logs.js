/**
 * Send Logs to API
 * 
 * Simple script to send logs directly to the API
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const API_URL = 'https://blockchain-log-production.up.railway.app/api/logs';
const AUTH = {
  username: 'admin',
  password: 'changeme'
};

// Generate random logs
function generateLogs(count) {
  const logs = [];
  const levels = ['INFO', 'WARN', 'ERROR'];
  const sources = ['auth-service', 'db-service', 'monitor-service', 'api-service', 'user-service'];
  
  for (let i = 0; i < count; i++) {
    logs.push({
      timestamp: new Date().toISOString(),
      level: levels[Math.floor(Math.random() * levels.length)],
      message: `Test log ${i+1} with random ID: ${Math.random().toString(36).substring(2, 15)}`,
      source: sources[Math.floor(Math.random() * sources.length)]
    });
  }
  
  return logs;
}

// Send logs to API
async function sendLogs(logs) {
  try {
    console.log(`Sending ${logs.length} logs to ${API_URL}...`);
    
    const response = await axios.post(API_URL, logs, {
      auth: AUTH,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending logs:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Get logs that were sent
async function getLogs() {
  try {
    console.log('Getting recent logs...');
    
    const response = await axios.get(`${API_URL.replace('/logs', '')}/logs/recent`, {
      auth: AUTH
    });
    
    console.log(`Retrieved ${response.data.logs?.length || 0} logs`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error getting logs:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Main function
async function main() {
  // Generate and send logs
  const logCount = process.argv[2] ? parseInt(process.argv[2]) : 10;
  const logs = generateLogs(logCount);
  
  try {
    // Send logs
    await sendLogs(logs);
    
    // Wait a moment then check if they were received
    console.log('Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get logs
    await getLogs();
    
  } catch (error) {
    console.error('Operation failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();

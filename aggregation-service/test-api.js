/**
 * Test API endpoints
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';
const AUTH = {
  username: 'admin',
  password: 'changeme'
};

// Test functions
async function testSystemStatus() {
  console.log('Testing /api/status endpoint...');
  
  try {
    const response = await axios.get(`${API_URL}/status`);
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing system status:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    return false;
  }
}

async function testRecentLogs() {
  console.log('Testing /api/logs/recent endpoint...');
  
  try {
    const response = await axios.get(`${API_URL}/logs/recent?limit=5`);
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing recent logs:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    return false;
  }
}

async function testBatchesList() {
  console.log('Testing /api/batches endpoint...');
  
  try {
    const response = await axios.get(`${API_URL}/batches`);
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing batches list:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    return false;
  }
}

async function testSubmitLog() {
  console.log('Testing /api/logs endpoint...');
  
  const testLog = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: 'Test log from API test script',
    source: 'test-api.js'
  };
  
  try {
    const response = await axios.post(
      `${API_URL}/logs`, 
      testLog,
      { auth: AUTH }
    );
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing log submission:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    return false;
  }
}

async function testVerifyLog() {
  console.log('Testing /api/verify endpoint...');
  
  const testLog = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message: 'Test log for verification',
    source: 'test-api.js'
  };
  
  try {
    // First submit a log to verify
    const submitResponse = await axios.post(
      `${API_URL}/logs`, 
      testLog,
      { auth: AUTH }
    );
    
    console.log('Submitted log for testing verification');
    
    // Wait a moment to let processing happen (in a real test you would wait for batch processing)
    console.log('Waiting 2 seconds before verification...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Now try to verify it (this might fail if batch processing hasn't happened yet)
    const verifyResponse = await axios.post(`${API_URL}/verify`, { log: testLog });
    console.log('Status:', verifyResponse.status);
    console.log('Data:', JSON.stringify(verifyResponse.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing log verification:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  let results = {
    systemStatus: false,
    recentLogs: false,
    batchesList: false,
    submitLog: false,
    verifyLog: false
  };
  
  console.log('=== API TEST START ===');
  
  // Run tests one by one
  results.systemStatus = await testSystemStatus();
  console.log('\n');
  
  results.recentLogs = await testRecentLogs();
  console.log('\n');
  
  results.batchesList = await testBatchesList();
  console.log('\n');
  
  results.submitLog = await testSubmitLog();
  console.log('\n');
  
  results.verifyLog = await testVerifyLog();
  
  // Summary
  console.log('\n=== API TEST RESULTS ===');
  for (const [test, passed] of Object.entries(results)) {
    console.log(`${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  }
  
  const overallSuccess = Object.values(results).every(Boolean);
  console.log(`\nOverall: ${overallSuccess ? 'SUCCESS' : 'FAILURE'}`);
  console.log('=== API TEST END ===');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testSystemStatus,
  testRecentLogs,
  testBatchesList,
  testSubmitLog,
  testVerifyLog
};

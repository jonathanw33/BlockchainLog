/**
 * Simple Verification Test
 * 
 * This script tests the verification functionality fix for cross-batch issues.
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

/**
 * Verifies a log
 * @param {Object} log The log to verify
 * @param {Number} batchId Optional batch ID
 * @returns {Promise<Object>} The verification result
 */
async function verifyLog(log, batchId = null) {
  try {
    const payload = { log };
    if (batchId !== null) {
      payload.batchId = batchId;
    }
    
    console.log(`Sending verification request:`, JSON.stringify(payload, null, 2));
    const response = await axios.post(`${API_URL}/verify`, payload);
    return response.data;
  } catch (error) {
    console.error(`${colors.red}Error verifying log:${colors.reset}`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Tests the verification functionality
 */
async function runTest() {
  console.log(`${colors.bright}${colors.magenta}=============================${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}  SIMPLE VERIFICATION TEST  ${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}=============================${colors.reset}\n`);

  try {
    // Test specific Batch ID verification
    console.log(`${colors.bright}${colors.cyan}Testing verification with specific batch ID...${colors.reset}\n`);
    
    // If you need to use a different batch ID, replace it here
    const batchId = 166;
    
    // This is a test log that should match a log in batch 166
    const testLog = {
      "timestamp": "2025-03-31T10:01:00Z",
      "level": "WARN",
      "message": "High memory usage detected: 85%",
      "source": "monitor-service"
    };
    
    // Verify the log with explicit batch ID
    console.log(`Verifying log in batch ${batchId}...`);
    const result = await verifyLog(testLog, batchId);
    
    // Log the result
    console.log(`\n${colors.bright}${colors.cyan}Verification Result:${colors.reset}`);
    console.log(JSON.stringify(result, null, 2));
    
    // Test with a modified message (should fail verification)
    console.log(`\n${colors.bright}${colors.cyan}Testing verification with tampered log...${colors.reset}\n`);
    
    const tamperedLog = {
      ...testLog,
      message: "High memory usage detected: 95%" // Changed from 85% to 95%
    };
    
    // Verify the tampered log
    console.log(`Verifying tampered log in batch ${batchId}...`);
    const tamperedResult = await verifyLog(tamperedLog, batchId);
    
    // Log the result
    console.log(`\n${colors.bright}${colors.cyan}Tampered Verification Result:${colors.reset}`);
    console.log(JSON.stringify(tamperedResult, null, 2));
    
    // Verify success or failure
    const originalSuccess = result.verified === true;
    const tamperedFailure = tamperedResult.verified === false;
    
    console.log(`\n${colors.bright}${colors.magenta}===============${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}  TEST RESULTS  ${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}===============${colors.reset}\n`);
    
    console.log(`Original log verification: ${originalSuccess ? colors.green + 'PASSED' : colors.red + 'FAILED'} ${colors.reset}`);
    console.log(`Tampered log verification: ${tamperedFailure ? colors.green + 'CORRECTLY FAILED' : colors.red + 'UNEXPECTEDLY PASSED'} ${colors.reset}`);
    
    if (tamperedFailure && tamperedResult.failureReason) {
      console.log(`\n${colors.bright}${colors.green}Success: Detailed failure reason provided${colors.reset}`);
      console.log(`Failure Type: ${colors.yellow}${tamperedResult.failureReason.type}${colors.reset}`);
      console.log(`Description: ${colors.yellow}${tamperedResult.failureReason.description}${colors.reset}`);
      
      if (tamperedResult.failureReason.details) {
        console.log(`\nDetails: ${JSON.stringify(tamperedResult.failureReason.details, null, 2)}`);
      }
    }
    
  } catch (error) {
    console.error(`\n${colors.bright}${colors.red}Test error:${colors.reset}`, error);
  }
}

// Run the test
runTest().catch(error => {
  console.error(`${colors.bright}${colors.red}Unhandled error:${colors.reset}`, error);
});

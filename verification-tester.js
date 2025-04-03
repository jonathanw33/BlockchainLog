/**
 * Verification Tester
 * 
 * This script tests the verification functionality of the Blockchain Log system,
 * specifically focusing on cross-batch verification issues and error handling.
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const API_URL = 'http://localhost:3000/api';
const LOG_ARCHIVE_PATH = path.join(__dirname, 'log-archive', 'archive');

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
 * Sends a log to the API
 * @param {Object} log The log to send
 * @returns {Promise<Object>} The API response
 */
async function sendLog(log) {
  try {
    const response = await axios.post(`${API_URL}/logs`, log);
    return response.data;
  } catch (error) {
    console.error(`${colors.red}Error sending log:${colors.reset}`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Processes logs into a batch
 * This is a test helper that simulates the batch processing
 * @returns {Promise<void>}
 */
async function triggerBatchProcessing() {
  // In a real system, this would call an API endpoint to trigger processing
  // For test purposes, we'll just wait to let the service process the logs
  console.log(`${colors.yellow}Waiting for batch processing...${colors.reset}`);
  await new Promise(resolve => setTimeout(resolve, 5000));
}

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
    
    const response = await axios.post(`${API_URL}/verify`, payload);
    return response.data;
  } catch (error) {
    console.error(`${colors.red}Error verifying log:${colors.reset}`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Modifies a log in the archive (simulating tampering)
 * @param {Number} batchId The batch ID
 * @param {String} logId The log ID
 * @param {Object} modifications The fields to modify
 * @returns {Promise<Object>} The modified log
 */
async function tamperWithLog(batchId, logId, modifications) {
  const batchPath = path.join(LOG_ARCHIVE_PATH, `batch_${batchId}`);
  const logsPath = path.join(batchPath, 'logs.json');
  
  // Read logs from file
  const logs = await fs.readJson(logsPath);
  
  // Find the log
  const logIndex = logs.findIndex(log => log.id === logId);
  if (logIndex === -1) {
    throw new Error(`Log ${logId} not found in batch ${batchId}`);
  }
  
  // Modify the log
  const originalLog = { ...logs[logIndex] };
  logs[logIndex] = { ...logs[logIndex], ...modifications };
  
  // Write logs back to file
  await fs.writeJson(logsPath, logs, { spaces: 2 });
  
  console.log(`${colors.yellow}Tampered with log ${logId} in batch ${batchId}:${colors.reset}`);
  console.log(` - Original: ${JSON.stringify(originalLog)}`);
  console.log(` - Modified: ${JSON.stringify(logs[logIndex])}`);
  
  return logs[logIndex];
}

/**
 * Gets the latest batch ID
 * @returns {Promise<Number>} The latest batch ID
 */
async function getLatestBatchId() {
  try {
    const response = await axios.get(`${API_URL}/batches?limit=1`);
    if (response.data.batches && response.data.batches.length > 0) {
      return response.data.batches[0].batchId;
    }
    return null;
  } catch (error) {
    console.error(`${colors.red}Error getting latest batch:${colors.reset}`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Gets logs from a batch
 * @param {Number} batchId The batch ID
 * @returns {Promise<Array>} The logs in the batch
 */
async function getBatchLogs(batchId) {
  const batchPath = path.join(LOG_ARCHIVE_PATH, `batch_${batchId}`);
  const logsPath = path.join(batchPath, 'logs.json');
  
  if (!await fs.pathExists(logsPath)) {
    throw new Error(`Batch ${batchId} logs not found`);
  }
  
  return await fs.readJson(logsPath);
}

/**
 * Prints a test title
 * @param {String} title The test title
 */
function printTestTitle(title) {
  console.log(`\n${colors.bright}${colors.cyan}=== ${title} ===${colors.reset}\n`);
}

/**
 * Prints a test result
 * @param {String} message The result message
 * @param {Boolean} success Whether the test succeeded
 */
function printTestResult(message, success) {
  const color = success ? colors.green : colors.red;
  const status = success ? 'PASS' : 'FAIL';
  console.log(`${color}[${status}] ${message}${colors.reset}`);
}

/**
 * Main test function
 */
async function runTests() {
  console.log(`${colors.bright}${colors.magenta}====================================${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}  BLOCKCHAIN LOG VERIFICATION TEST ${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}====================================${colors.reset}\n`);
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  try {
    // Create test logs with similar content but different batches
    printTestTitle("Creating test logs in different batches");
    
    // Create a base log for testing
    const baseLog = {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: "Blockchain verification test log",
      source: "verification-tester.js"
    };
    
    // Create the first log
    const firstLog = { ...baseLog, message: baseLog.message + " #1" };
    console.log(`Sending first log: ${JSON.stringify(firstLog)}`);
    await sendLog(firstLog);
    
    // Trigger batch processing for the first log
    await triggerBatchProcessing();
    
    // Get the batch ID for the first log
    const firstBatchId = await getLatestBatchId();
    console.log(`First log is in batch ${firstBatchId}`);
    
    // Ensure the service has written the batch to disk
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get the log ID from the batch
    const firstBatchLogs = await getBatchLogs(firstBatchId);
    const firstLogInBatch = firstBatchLogs.find(log => 
      log.message === firstLog.message &&
      log.source === firstLog.source
    );
    
    if (!firstLogInBatch) {
      throw new Error(`First log not found in batch ${firstBatchId}`);
    }
    console.log(`Found first log in batch with ID: ${firstLogInBatch.id}`);
    
    // Create the second log (similar content)
    const secondLog = { ...baseLog, message: baseLog.message + " #2" };
    console.log(`\nSending second log: ${JSON.stringify(secondLog)}`);
    await sendLog(secondLog);
    
    // Trigger batch processing for the second log
    await triggerBatchProcessing();
    
    // Get the batch ID for the second log
    const secondBatchId = await getLatestBatchId();
    console.log(`Second log is in batch ${secondBatchId}`);
    
    // Ensure the service has written the batch to disk
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get the log ID from the batch
    const secondBatchLogs = await getBatchLogs(secondBatchId);
    const secondLogInBatch = secondBatchLogs.find(log => 
      log.message === secondLog.message &&
      log.source === secondLog.source
    );
    
    if (!secondLogInBatch) {
      throw new Error(`Second log not found in batch ${secondBatchId}`);
    }
    console.log(`Found second log in batch with ID: ${secondLogInBatch.id}`);
    
    // Test 1: Verify both logs should pass
    printTestTitle("Test 1: Initial verification of both logs");
    
    // Verify first log
    console.log("Verifying first log...");
    const firstVerificationResult = await verifyLog(firstLog, firstBatchId);
    const firstVerified = firstVerificationResult.verified;
    printTestResult("First log verification", firstVerified);
    if (firstVerified) testsPassed++; else testsFailed++;
    
    // Verify second log
    console.log("\nVerifying second log...");
    const secondVerificationResult = await verifyLog(secondLog, secondBatchId);
    const secondVerified = secondVerificationResult.verified;
    printTestResult("Second log verification", secondVerified);
    if (secondVerified) testsPassed++; else testsFailed++;
    
    // Test 2: Tamper with first log and verify both logs
    printTestTitle("Test 2: Tampering with first log");
    
    // Tamper with the first log
    const tamperedMessage = firstLog.message + " (TAMPERED)";
    const tamperedLog = await tamperWithLog(firstBatchId, firstLogInBatch.id, {
      message: tamperedMessage
    });
    
    // Verify the tampered log (should fail)
    console.log("\nVerifying tampered first log...");
    const tamperedVerificationResult = await verifyLog(tamperedLog, firstBatchId);
    const tamperedVerified = tamperedVerificationResult.verified;
    printTestResult("Tampered log verification should fail", !tamperedVerified);
    if (!tamperedVerified) testsPassed++; else testsFailed++;
    
    // Check for detailed failure reason
    const hasFailureReason = tamperedVerificationResult.failureReason !== undefined;
    printTestResult("Tampered log has detailed failure reason", hasFailureReason);
    if (hasFailureReason) {
      console.log(`Failure reason: ${JSON.stringify(tamperedVerificationResult.failureReason, null, 2)}`);
      testsPassed++;
    } else {
      testsFailed++;
    }
    
    // Verify the second log (should still pass despite the first being tampered)
    console.log("\nVerifying second log after tampering with first log...");
    const secondVerificationAfterTamper = await verifyLog(secondLog, secondBatchId);
    const secondVerifiedAfterTamper = secondVerificationAfterTamper.verified;
    printTestResult("Second log verification should still pass", secondVerifiedAfterTamper);
    if (secondVerifiedAfterTamper) testsPassed++; else testsFailed++;
    
    // Test 3: Cross-batch verification using content matches
    printTestTitle("Test 3: Cross-batch verification test");
    
    // Create a similar log to the first one but put it in a new batch
    const similarLog = { ...baseLog, message: baseLog.message + " #1-similar" };
    console.log(`Sending similar log: ${JSON.stringify(similarLog)}`);
    await sendLog(similarLog);
    
    // Trigger batch processing for the similar log
    await triggerBatchProcessing();
    
    // Get the batch ID for the similar log
    const similarBatchId = await getLatestBatchId();
    console.log(`Similar log is in batch ${similarBatchId}`);
    
    // Ensure the service has written the batch to disk
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify the similar log without specifying batch ID
    // The service should find the correct batch even with similar logs in different batches
    console.log("\nVerifying similar log without specifying batch ID...");
    const similarVerificationResult = await verifyLog(similarLog);
    const similarVerified = similarVerificationResult.verified;
    printTestResult("Similar log verification", similarVerified);
    if (similarVerified) testsPassed++; else testsFailed++;
    
    // Test 4: Error handling and malformed data
    printTestTitle("Test 4: Error handling and malformed data");
    
    // Try to verify a log that doesn't exist
    const nonExistentLog = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      message: "This log doesn't exist in any batch",
      source: "non-existent-source"
    };
    
    console.log("Verifying non-existent log...");
    try {
      await verifyLog(nonExistentLog);
      printTestResult("Non-existent log should cause an error", false);
      testsFailed++;
    } catch (error) {
      printTestResult("Non-existent log correctly caused an error", true);
      testsPassed++;
    }
    
    // Try to verify a log with missing required fields
    const malformedLog = {
      timestamp: new Date().toISOString(),
      // Missing 'level' field
      message: "Malformed log entry"
      // Missing 'source' field
    };
    
    console.log("\nVerifying malformed log...");
    try {
      await verifyLog(malformedLog);
      printTestResult("Malformed log should cause an error", false);
      testsFailed++;
    } catch (error) {
      printTestResult("Malformed log correctly caused an error", true);
      testsPassed++;
    }
    
    // Test 5: Multiple back-to-back verifications
    printTestTitle("Test 5: Multiple back-to-back verifications");
    
    // Verify the same log multiple times in quick succession
    // This tests if the terminal crashes after verification
    console.log("Performing multiple verifications of the same log...");
    
    const verificationPromises = [];
    for (let i = 0; i < 5; i++) {
      verificationPromises.push(verifyLog(secondLog, secondBatchId));
    }
    
    try {
      const results = await Promise.all(verificationPromises);
      const allSuccessful = results.every(result => result.verified);
      printTestResult("Multiple verifications completed successfully", allSuccessful);
      if (allSuccessful) testsPassed++; else testsFailed++;
    } catch (error) {
      printTestResult("Multiple verifications should not cause errors", false);
      testsFailed++;
    }
    
    // Print test summary
    console.log(`\n${colors.bright}${colors.magenta}===============${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}  TEST SUMMARY  ${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}===============${colors.reset}\n`);
    console.log(`${colors.green}Tests Passed: ${testsPassed}${colors.reset}`);
    console.log(`${colors.red}Tests Failed: ${testsFailed}${colors.reset}`);
    
    if (testsFailed === 0) {
      console.log(`\n${colors.bright}${colors.green}All tests passed! The fixes were successful.${colors.reset}`);
    } else {
      console.log(`\n${colors.bright}${colors.red}Some tests failed. Please review the results above.${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`\n${colors.bright}${colors.red}Test execution error:${colors.reset}`, error);
    console.log(`\n${colors.bright}${colors.red}Tests Failed: Unable to complete all tests${colors.reset}`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.bright}${colors.red}Unhandled error:${colors.reset}`, error);
});

/**
 * Blockchain Log Integrity System - End-to-End Test Flow
 * 
 * This script tests the entire system flow from log generation to verification.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Enable test mode for blockchain
process.env.TEST_MODE = 'true';

console.log('Blockchain Log Integrity System - End-to-End Test');
console.log('================================================');

// Helper function to run a command in a specific directory
function runCommand(command, directory) {
  console.log(`\nRunning: ${command} in ${directory}`);
  try {
    const output = execSync(command, { 
      cwd: directory,
      stdio: 'inherit'
    });
    return true;
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    return false;
  }
}

// Install dependencies for a component
function installDependencies(directory) {
  console.log(`\nInstalling dependencies in ${directory}...`);
  return runCommand('npm install', directory);
}

// Test flow
async function runTestFlow() {
  const rootDir = __dirname;
  const components = [
    'log-generator',
    'log-shipper',
    'aggregation-service',
    'verification-tool'
  ];
  
  // Step 0: Install dependencies for all components
  console.log('\n=== Step 0: Installing Dependencies ===');
  for (const component of components) {
    const componentDir = path.join(rootDir, component);
    if (!installDependencies(componentDir)) {
      console.error(`Failed to install dependencies for ${component}. Aborting test.`);
      return;
    }
  }
  
  // Step 1: Generate logs
  console.log('\n=== Step 1: Generate Logs ===');
  if (!runCommand('node src/index.js generate --count 10', path.join(rootDir, 'log-generator'))) {
    return;
  }
  
  // Pause to ensure logs are written
  console.log('\nWaiting for logs to be written...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Process logs with aggregation service
  console.log('\n=== Step 2: Process Logs with Aggregation Service ===');
  if (!runCommand('node test.js', path.join(rootDir, 'aggregation-service'))) {
    return;
  }
  
  // Pause to ensure batch is processed
  console.log('\nWaiting for batch processing to complete...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 3: Verify a log
  console.log('\n=== Step 3: Verify Log ===');
  
  // First run the verification tool test to generate a sample log
  if (!runCommand('node test.js', path.join(rootDir, 'verification-tool'))) {
    return;
  }
  
  // Result should be successful since we just processed these logs
  console.log('\nTest flow completed successfully!');
  console.log('\nThe system components have been tested end-to-end:');
  console.log('1. Log Generator: Created sample logs');
  console.log('2. Aggregation Service: Processed logs into batches and stored Merkle roots');
  console.log('3. Verification Tool: Found and verified a log from the batch');
  
  console.log('\nTo test tampering detection:');
  console.log('1. Find a log file in log-archive/archive/batch_X/logs.json');
  console.log('2. Modify some content in the file');
  console.log('3. Run the verification tool again - it should fail verification');
}

// Run the test flow
runTestFlow();

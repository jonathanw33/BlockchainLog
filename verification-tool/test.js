/**
 * Verification Tool Test Script
 * 
 * This script tests the verification tool with a sample log
 */

const fs = require('fs-extra');
const path = require('path');

console.log('Verification Tool Test');
console.log('=====================');

// Sample log for testing
const sampleLog = {
  timestamp: '2025-03-31T10:00:00Z',
  level: 'INFO',
  message: 'User alice logged in successfully',
  source: 'auth-service'
};

// Create a sample file to test verification from file
async function createSampleFile() {
  const sampleFilePath = path.join(__dirname, 'sample_log.json');
  await fs.writeJson(sampleFilePath, sampleLog, { spaces: 2 });
  console.log(`Created sample log file at: ${sampleFilePath}`);
  return sampleFilePath;
}

// Test verification
async function runTest() {
  try {
    console.log('Creating sample log file...');
    const sampleFilePath = await createSampleFile();
    
    // Ensure the archive directory exists
    const archivePath = path.join(__dirname, '../log-archive/archive');
    if (!fs.existsSync(archivePath)) {
      console.log('Archive directory not found. Creating it...');
      fs.ensureDirSync(archivePath);
    }
    
    console.log('\nChecking for batches...');
    let batchDirs = [];
    try {
      batchDirs = fs.readdirSync(archivePath).filter(dir => dir.startsWith('batch_'));
    } catch (error) {
      console.log('Error reading archive directory:', error.message);
    }
    
    if (batchDirs.length === 0) {
      console.log('No batch directories found in the archive.');
      console.log('Please run the aggregation service test first to create a batch with logs.');
      console.log('\nAfter creating a batch, run:');
      console.log(`node src/index.js verify --file "sample_log.json"`);
    } else {
      console.log(`Found ${batchDirs.length} batch directories.`);
      
      try {
        const { findBatchForLog } = require('./src/index');
        console.log('\nSearching for batch containing sample log...');
        const result = await findBatchForLog(sampleLog);
        
        if (result) {
          console.log(`Found log in batch ${result.batchId} with ID ${result.logId}`);
          console.log('\nTo verify this log, run:');
          console.log(`node src/index.js verify --file "${sampleFilePath}" --batch ${result.batchId}`);
        } else {
          console.log('Log not found in any batch.');
          console.log('\nTo verify with a specific batch, run:');
          const firstBatch = parseInt(batchDirs[0].replace('batch_', ''));
          console.log(`node src/index.js verify --file "${sampleFilePath}" --batch ${firstBatch}`);
        }
      } catch (error) {
        console.log('Error searching for log:', error.message);
        console.log('This is expected if running the test before installing dependencies.');
        console.log('Please run npm install and then try again.');
      }
    }
    
    console.log('\nTest completed.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();

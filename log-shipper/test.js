/**
 * Log Shipper Test Script
 * 
 * This script tests the log shipper functionality
 */

const fs = require('fs-extra');
const path = require('path');
const { processLogLines } = require('./src/index');

console.log('Log Shipper Test');
console.log('===============');

// Mock destination endpoint
// In a real test, we'd use a mock HTTP server
// Here we'll just override the sendLogsToDestination function

const logPath = '../logs/application.log';

// Check if log file exists
if (!fs.existsSync(logPath)) {
  console.log('Log file does not exist. Please run the log generator first to create some logs.');
  process.exit(1);
}

// Read log file
const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\\n').filter(line => line.trim() !== '');

console.log(`Found ${lines.length} log lines to process`);

// Process the lines (this will log the parsed logs)
console.log('Processing log lines:');
processLogLines(logPath, lines);

console.log('Test complete.');

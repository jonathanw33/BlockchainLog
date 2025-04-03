/**
 * Log Generator Test Script
 * 
 * This script tests the log generator functionality
 */

const { generateBatch } = require('./src/index');

console.log('Log Generator Test');
console.log('=================');
console.log('Generating 10 sample logs...');

// Generate 10 sample logs
generateBatch(10);

console.log('Test complete. Check the logs directory for output.');

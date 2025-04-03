/**
 * Log Generator
 * 
 * Simulates log creation for testing the system
 */

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');
const { format } = require('date-fns');

// Default configuration (used if config loading fails)
const defaultConfig = {
  output: {
    directory: "../logs",
    filename: "application.log"
  },
  generation: {
    rate: 10,
    format: "json"
  },
  templates: [
    {"level": "INFO", "message": "User '{user}' logged in successfully", "source": "auth-service"},
    {"level": "ERROR", "message": "Failed to connect to database", "source": "db-service"},
    {"level": "WARN", "message": "High memory usage detected: {usage}%", "source": "monitor-service"}
  ],
  variables: {
    "user": ["alice", "bob", "charlie", "dave", "eve"],
    "usage": [75, 80, 85, 90, 95]
  }
};

// Try to load configuration from config file, fall back to default config if it fails
let config;
try {
  config = require('config');
  console.log('Loaded configuration from config file');
} catch (error) {
  config = {
    get: (key) => {
      const parts = key.split('.');
      let value = defaultConfig;
      for (const part of parts) {
        value = value[part];
        if (value === undefined) {
          return undefined;
        }
      }
      return value;
    }
  };
  console.log('Using default configuration');
}

// Load configuration
const outputDir = config.get('output.directory');
const outputFile = config.get('output.filename');
const generationRate = config.get('generation.rate');
const logFormat = config.get('generation.format');
const templates = config.get('templates');
const variables = config.get('variables');

// Ensure output directory exists
fs.ensureDirSync(outputDir);
const logFilePath = path.join(outputDir, outputFile);

// Global variables
let isRunning = false;
let interval = null;

// Generate a random log based on templates
function generateRandomLog() {
  const template = templates[Math.floor(Math.random() * templates.length)];
  const timestamp = new Date().toISOString();
  
  // Create a copy of the template
  const log = {...template, timestamp};
  
  // Replace variables in the message
  let message = log.message;
  
  // Replace each variable placeholder with a random value
  Object.keys(variables).forEach(varName => {
    const values = variables[varName];
    const randomValue = values[Math.floor(Math.random() * values.length)];
    message = message.replace(`{${varName}}`, randomValue);
  });
  
  log.message = message;
  return log;
}

// Write a log to file
function writeLog(log) {
  const logStr = logFormat === 'json' ? JSON.stringify(log) + '\n' : 
    `[${log.timestamp}] ${log.level} [${log.source}] ${log.message}\n`;
  
  fs.appendFileSync(logFilePath, logStr);
  console.log(`Log written: ${logStr.trim()}`);
}

// Start generating logs at the specified rate
function startGeneration(rate = generationRate) {
  if (isRunning) {
    console.log('Log generation is already running');
    return;
  }
  
  const intervalMs = Math.floor(60000 / rate); // Convert rate per minute to ms interval
  
  console.log(`Starting log generation at rate of ${rate} logs/minute (interval: ${intervalMs}ms)`);
  isRunning = true;
  
  interval = setInterval(() => {
    const log = generateRandomLog();
    writeLog(log);
  }, intervalMs);
}

// Stop log generation
function stopGeneration() {
  if (!isRunning) {
    console.log('Log generation is not running');
    return;
  }
  
  clearInterval(interval);
  isRunning = false;
  console.log('Log generation stopped');
}

// Generate a specific number of logs immediately
function generateBatch(count) {
  console.log(`Generating batch of ${count} logs`);
  
  for (let i = 0; i < count; i++) {
    const log = generateRandomLog();
    writeLog(log);
  }
  
  console.log(`Generated ${count} logs`);
}

// CLI setup
program
  .name('log-generator')
  .description('Generate sample logs for testing')
  .version('1.0.0');

program
  .command('start')
  .description('Start generating logs at the specified rate')
  .option('-r, --rate <number>', 'Logs per minute', parseInt)
  .action((options) => {
    startGeneration(options.rate || generationRate);
  });

program
  .command('stop')
  .description('Stop generating logs')
  .action(() => {
    stopGeneration();
  });

program
  .command('generate')
  .description('Generate a batch of logs immediately')
  .requiredOption('-c, --count <number>', 'Number of logs to generate', parseInt)
  .action((options) => {
    generateBatch(options.count);
  });

program.parse();

// Export functions for testing
module.exports = {
  generateRandomLog,
  writeLog,
  startGeneration,
  stopGeneration,
  generateBatch
};

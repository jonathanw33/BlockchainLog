/**
 * Log Shipper
 * 
 * Collects logs from sources and forwards them to the aggregation service
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const chokidar = require('chokidar');

// Default configuration
const defaultConfig = {
  sources: [
    {
      path: "../logs/application.log",
      type: "json"
    }
  ],
  destination: {
    url: "http://localhost:3000/api/logs",
    auth: {
      username: "admin",
      password: "changeme"
    },
    batchSize: 10,
    retryInterval: 5000
  },
  buffer: {
    enabled: true,
    path: "./buffer",
    maxSize: 100
  }
};

// Try to load configuration, fall back to default if it fails
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
const sources = config.get('sources');
const destination = config.get('destination');
const buffer = config.get('buffer');

// Ensure buffer directory exists if buffering is enabled
if (buffer.enabled) {
  fs.ensureDirSync(buffer.path);
}

// Store file positions
const filePositions = {};

// Process new log lines
async function processLogLines(filePath, lines) {
  console.log(`Processing ${lines.length} new lines from ${filePath}`);
  
  // Find the source configuration for this file
  const source = sources.find(s => s.path === filePath);
  
  if (!source) {
    console.error(`No source configuration found for ${filePath}`);
    return;
  }
  
  // Parse logs based on the source type
  const logs = lines.map(line => {
    if (source.type === 'json') {
      try {
        return JSON.parse(line);
      } catch (error) {
        console.error(`Error parsing JSON log: ${line}`);
        return null;
      }
    } else {
      // Simple text log parsing - this would be more sophisticated in a real implementation
      const match = line.match(/\\[(.*?)\\] (\\w+) \\[(.*?)\\] (.*)/);
      if (match) {
        return {
          timestamp: match[1],
          level: match[2],
          source: match[3],
          message: match[4]
        };
      }
      return null;
    }
  }).filter(log => log !== null);
  
  if (logs.length === 0) {
    return;
  }
  
  // Send logs to the destination in batches
  const batchSize = destination.batchSize || logs.length;
  const batches = [];
  
  for (let i = 0; i < logs.length; i += batchSize) {
    batches.push(logs.slice(i, i + batchSize));
  }
  
  for (const batch of batches) {
    try {
      await sendLogsToDestination(batch);
    } catch (error) {
      console.error('Error sending logs to destination:', error.message);
      
      if (buffer.enabled) {
        bufferLogs(batch);
      }
    }
  }
}

// Send logs to the destination
async function sendLogsToDestination(logs) {
  console.log(`Sending ${logs.length} logs to ${destination.url}`);
  
  const auth = destination.auth ? {
    username: destination.auth.username,
    password: destination.auth.password
  } : undefined;
  
  await axios.post(destination.url, logs, { auth });
}

// Buffer logs for retry
function bufferLogs(logs) {
  if (!buffer.enabled) return;
  
  console.log(`Buffering ${logs.length} logs for retry`);
  
  const timestamp = new Date().getTime();
  const bufferFile = path.join(buffer.path, `buffer_${timestamp}.json`);
  
  fs.writeJsonSync(bufferFile, logs);
}

// Retry sending buffered logs
async function retryBufferedLogs() {
  if (!buffer.enabled) return;
  
  console.log('Checking for buffered logs to retry');
  
  const files = await fs.readdir(buffer.path);
  const bufferFiles = files.filter(file => file.startsWith('buffer_'));
  
  for (const file of bufferFiles) {
    const filePath = path.join(buffer.path, file);
    
    try {
      const logs = await fs.readJson(filePath);
      await sendLogsToDestination(logs);
      
      // If successful, delete the buffer file
      await fs.remove(filePath);
      console.log(`Successfully sent and removed buffer file: ${file}`);
    } catch (error) {
      console.error(`Failed to retry buffered logs from ${file}:`, error.message);
    }
  }
}

// Start watching log files
function startWatching() {
  console.log('Starting log shipper...');
  
  // Create a watcher for each source
  for (const source of sources) {
    console.log(`Watching ${source.path} for changes`);
    
    // Initialize the file position
    try {
      const stats = fs.statSync(source.path);
      filePositions[source.path] = stats.size;
    } catch (error) {
      // File doesn't exist yet, set position to 0
      filePositions[source.path] = 0;
    }
    
    // Watch for changes
    const watcher = chokidar.watch(source.path, {
      persistent: true,
      ignoreInitial: true
    });
    
    watcher.on('change', (filePath) => {
      processFile(filePath);
    });
  }
  
  // Set up retry interval for buffered logs
  if (buffer.enabled && destination.retryInterval) {
    setInterval(retryBufferedLogs, destination.retryInterval);
  }
}

// Process a file for new log lines
function processFile(filePath) {
  const currentPosition = filePositions[filePath] || 0;
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileSize = Buffer.byteLength(fileContent, 'utf8');
    
    if (fileSize > currentPosition) {
      // Extract only the new content
      const newContent = fileContent.slice(currentPosition);
      const lines = newContent.split('\n').filter(line => line.trim() !== '');
      
      // Update the file position
      filePositions[filePath] = fileSize;
      
      // Process the new lines
      processLogLines(filePath, lines);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

// Only start watching if this is the main module
if (require.main === module) {
  startWatching();
}

// Export functions for testing
module.exports = {
  processLogLines,
  sendLogsToDestination,
  bufferLogs,
  retryBufferedLogs,
  processFile
};

/**
 * Storage Service
 * 
 * Handles temporary and archive storage of logs
 */

const fs = require('fs-extra');
const path = require('path');
const { format } = require('date-fns');

// Default configuration
const defaultConfig = {
  storage: {
    tempPath: "../log-archive/temp",
    archivePath: "../log-archive/archive"
  }
};

// Try to load configuration, fall back to default if it fails
let config;
try {
  config = require('config');
  console.log('Storage: Loaded configuration from config file');
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
  console.log('Storage: Using default configuration');
}

// Load configuration
const tempPath = config.get('storage.tempPath');
const archivePath = config.get('storage.archivePath');

// Ensure directories exist
fs.ensureDirSync(tempPath);
fs.ensureDirSync(archivePath);

/**
 * Store incoming logs in temporary storage
 * @param {Array} logs Array of log entries
 * @returns {Promise<void>}
 */
async function storeIncomingLogs(logs) {
  if (!logs || logs.length === 0) {
    return;
  }
  
  // Get date and time information
  const currentDate = new Date();
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const timeStr = format(currentDate, 'HH-mm-ss');
  
  // Create date directory if it doesn't exist
  const dateDir = path.join(tempPath, dateStr);
  await fs.ensureDir(dateDir);
  
  // Create a unique filename
  const fileName = `logs_${timeStr}_${Math.floor(Math.random() * 10000)}.json`;
  const filePath = path.join(dateDir, fileName);
  
  // Write logs to file
  await fs.writeJson(filePath, logs, { spaces: 2 });
  
  console.log(`Stored ${logs.length} logs in ${filePath}`);
}

/**
 * Get logs for processing
 * @returns {Promise<Array>} Array of logs to process
 */
async function getLogsForProcessing() {
  console.log('Collecting logs for processing');
  
  const logs = [];
  
  // Get all date directories
  const dateDirs = await fs.readdir(tempPath);
  
  for (const dateDir of dateDirs) {
    const dirPath = path.join(tempPath, dateDir);
    const stats = await fs.stat(dirPath);
    
    if (!stats.isDirectory()) {
      continue;
    }
    
    // Get all log files in this directory
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      if (!file.endsWith('.json')) {
        continue;
      }
      
      const filePath = path.join(dirPath, file);
      
      try {
        // Read logs from file
        const batchLogs = await fs.readJson(filePath);
        logs.push(...batchLogs);
        
        // Mark file as processed
        const processedPath = filePath + '.processed';
        await fs.rename(filePath, processedPath);
      } catch (error) {
        console.error(`Error reading logs from ${filePath}:`, error);
      }
    }
  }
  
  console.log(`Collected ${logs.length} logs for processing`);
  return logs;
}

/**
 * Archive a batch of processed logs
 * @param {Number} batchId The batch ID
 * @param {Array} logs Array of log entries
 * @param {Object} merkleProofs Merkle proofs for each log
 * @param {String} merkleRoot The Merkle root
 * @returns {Promise<void>}
 */
async function archiveBatch(batchId, logs, merkleProofs, merkleRoot) {
  console.log(`Archiving batch ${batchId} with ${logs.length} logs`);
  
  // Create batch directory
  const batchDir = path.join(archivePath, `batch_${batchId}`);
  await fs.ensureDir(batchDir);
  
  // Create metadata
  const metadata = {
    batchId,
    timestamp: new Date().toISOString(),
    merkleRoot,
    logCount: logs.length,
    timeRange: {
      start: logs.reduce((min, log) => !min || log.timestamp < min ? log.timestamp : min, null),
      end: logs.reduce((max, log) => !max || log.timestamp > max ? log.timestamp : max, null)
    }
  };
  
  // Write files
  await fs.writeJson(path.join(batchDir, 'metadata.json'), metadata, { spaces: 2 });
  await fs.writeJson(path.join(batchDir, 'logs.json'), logs, { spaces: 2 });
  await fs.writeJson(path.join(batchDir, 'proofs.json'), merkleProofs, { spaces: 2 });
  
  console.log(`Batch ${batchId} archived successfully`);
  
  // Clean up processed files
  await cleanupProcessedFiles();
}

/**
 * Clean up processed files
 * @returns {Promise<void>}
 */
async function cleanupProcessedFiles() {
  console.log('Cleaning up processed files');
  
  // Get all date directories
  const dateDirs = await fs.readdir(tempPath);
  
  for (const dateDir of dateDirs) {
    const dirPath = path.join(tempPath, dateDir);
    const stats = await fs.stat(dirPath);
    
    if (!stats.isDirectory()) {
      continue;
    }
    
    // Get all processed files in this directory
    const files = await fs.readdir(dirPath);
    const processedFiles = files.filter(file => file.endsWith('.json.processed'));
    
    for (const file of processedFiles) {
      const filePath = path.join(dirPath, file);
      await fs.remove(filePath);
    }
  }
}

/**
 * Find batch containing a specific log
 * @param {Object} log The log to find
 * @returns {Promise<Object|null>} Object with batchId and matchInfo or null if not found
 */
async function findBatchContainingLog(log) {
  console.log(`Searching for batch containing log: ${JSON.stringify(log)}`);
  
  // Get all batch directories
  const batchDirs = await fs.readdir(archivePath);
  
  // Sort batch directories numerically in descending order (newest first)
  // This ensures we check the most recent batches first
  batchDirs.sort((a, b) => {
    const aId = parseInt(a.replace('batch_', ''));
    const bId = parseInt(b.replace('batch_', ''));
    return bId - aId; // Descending order
  });
  
  // First, try to find an exact match
  for (const batchDir of batchDirs) {
    if (!batchDir.startsWith('batch_')) {
      continue;
    }
    
    const batchPath = path.join(archivePath, batchDir);
    const logsPath = path.join(batchPath, 'logs.json');
    
    if (!await fs.pathExists(logsPath)) {
      continue;
    }
    
    try {
      const logs = await fs.readJson(logsPath);
      const batchId = parseInt(batchDir.replace('batch_', ''));
      
      // Check if this batch contains an exact match for the log
      const exactMatch = logs.find(l => {
        const timestampMatch = l.timestamp === log.timestamp;
        const levelMatch = l.level === log.level;
        const messageMatch = l.message === log.message;
        const sourceMatch = l.source === log.source;
        
        // Log detailed information about matches
        if (timestampMatch && levelMatch && messageMatch && sourceMatch) {
          console.log(`Found exact log match in batch ${batchId}`);
        }
        
        return timestampMatch && levelMatch && messageMatch && sourceMatch;
      });
      
      if (exactMatch) {
        return { 
          batchId,
          logId: exactMatch.id,
          matchType: 'exact'
        };
      }
    } catch (error) {
      console.error(`Error reading logs from ${logsPath}:`, error);
    }
  }
  
  console.log('Exact log match not found in any batch');
  console.log('Log not found in any batch');
  return null;
}

/**
 * Get log and its proof from a batch
 * @param {Number} batchId The batch ID
 * @param {Object} log The log to find
 * @returns {Promise<Object>} The log entry and its proof
 */
async function getLogAndProof(batchId, log) {
  console.log(`Getting log and proof from batch ${batchId}`);
  
  const batchPath = path.join(archivePath, `batch_${batchId}`);
  const logsPath = path.join(batchPath, 'logs.json');
  const proofsPath = path.join(batchPath, 'proofs.json');
  
  if (!await fs.pathExists(logsPath) || !await fs.pathExists(proofsPath)) {
    console.error(`Batch ${batchId} files not found`);
    return { logEntry: null, proof: null };
  }
  
  try {
    const logs = await fs.readJson(logsPath);
    const proofs = await fs.readJson(proofsPath);
    
    // Find the exact log match only - no more "closest match" approach
    const logEntry = logs.find(l => {
      const timestampMatch = l.timestamp === log.timestamp;
      const levelMatch = l.level === log.level;
      const messageMatch = l.message === log.message;
      const sourceMatch = l.source === log.source;
      
      // Log detailed information about matches for debugging
      console.log(`Checking exact match in batch ${batchId}:`);
      console.log(`- Timestamp: ${timestampMatch ? 'MATCH' : 'MISMATCH'} ('${l.timestamp}' vs '${log.timestamp}')`);
      console.log(`- Level: ${levelMatch ? 'MATCH' : 'MISMATCH'} ('${l.level}' vs '${log.level}')`);
      console.log(`- Message: ${messageMatch ? 'MATCH' : 'MISMATCH'} ('${l.message}' vs '${log.message}')`);
      console.log(`- Source: ${sourceMatch ? 'MATCH' : 'MISMATCH'} ('${l.source}' vs '${log.source}')`);
      
      return timestampMatch && levelMatch && messageMatch && sourceMatch;
    });
    
    if (!logEntry) {
      console.error(`No exact matching log found in batch ${batchId}`);
      return { logEntry: null, proof: null };
    }
    
    // Get the proof for this log
    const proof = proofs[logEntry.id];
    
    if (!proof) {
      console.error(`Proof not found for log ${logEntry.id} in batch ${batchId}`);
      return { logEntry, proof: null };
    }
    
    return { logEntry, proof };
  } catch (error) {
    console.error(`Error getting log and proof from batch ${batchId}:`, error);
    return { logEntry: null, proof: null };
  }
}

/**
 * Get batch info
 * @param {Number} batchId The batch ID
 * @returns {Promise<Object|null>} The batch info or null if not found
 */
async function getBatchInfo(batchId) {
  console.log(`Getting info for batch ${batchId}`);
  
  const batchPath = path.join(archivePath, `batch_${batchId}`);
  const metadataPath = path.join(batchPath, 'metadata.json');
  
  if (!await fs.pathExists(metadataPath)) {
    console.error(`Batch ${batchId} metadata not found`);
    return null;
  }
  
  try {
    const metadata = await fs.readJson(metadataPath);
    return metadata;
  } catch (error) {
    console.error(`Error getting info for batch ${batchId}:`, error);
    return null;
  }
}

/**
 * List all batches
 * @returns {Promise<Array>} Array of batch info objects
 */
async function listBatches() {
  console.log('Listing all batches');
  
  const batches = [];
  
  // Get all batch directories
  const batchDirs = await fs.readdir(archivePath);
  
  for (const batchDir of batchDirs) {
    if (!batchDir.startsWith('batch_')) {
      continue;
    }
    
    const batchPath = path.join(archivePath, batchDir);
    const metadataPath = path.join(batchPath, 'metadata.json');
    
    if (!await fs.pathExists(metadataPath)) {
      continue;
    }
    
    try {
      const metadata = await fs.readJson(metadataPath);
      batches.push(metadata);
    } catch (error) {
      console.error(`Error reading metadata from ${metadataPath}:`, error);
    }
  }
  
  // Sort by batch ID
  batches.sort((a, b) => b.batchId - a.batchId);
  
  return batches;
}

/**
 * Get logs from a specific batch
 * @param {Number} batchId The batch ID
 * @returns {Promise<Array>} Array of log entries
 */
async function getBatchLogs(batchId) {
  console.log(`Getting logs from batch ${batchId}`);
  
  const batchPath = path.join(archivePath, `batch_${batchId}`);
  const logsPath = path.join(batchPath, 'logs.json');
  
  if (!await fs.pathExists(logsPath)) {
    console.error(`Batch ${batchId} logs not found`);
    return [];
  }
  
  try {
    const logs = await fs.readJson(logsPath);
    return logs;
  } catch (error) {
    console.error(`Error getting logs for batch ${batchId}:`, error);
    return [];
  }
}

module.exports = {
  storeIncomingLogs,
  getLogsForProcessing,
  archiveBatch,
  findBatchContainingLog,
  getLogAndProof,
  getBatchInfo,
  listBatches,
  getBatchLogs
};

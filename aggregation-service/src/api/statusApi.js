/**
 * Status API
 * 
 * API endpoints for system status and monitoring
 */

const express = require('express');
const router = express.Router();
const storageService = require('../storage/storageService');
const blockchainService = require('../blockchain/blockchainService');
const fs = require('fs-extra');
const path = require('path');

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
  console.log('Status API: Loaded configuration from config file');
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
  console.log('Status API: Using default configuration');
}

// Get system status endpoint
router.get('/status', async (req, res) => {
  try {
    // Get batch statistics
    const batches = await storageService.listBatches();
    const batchesProcessed = batches.length;
    
    let lastProcessed = null;
    let latestBatchId = null;
    let lastRoot = null;
    
    if (batchesProcessed > 0) {
      // Find the latest batch
      const latestBatch = batches.reduce((latest, batch) => {
        return batch.batchId > latest.batchId ? batch : latest;
      }, batches[0]);
      
      lastProcessed = latestBatch.timestamp;
      latestBatchId = latestBatch.batchId;
      lastRoot = latestBatch.merkleRoot;
    }
    
    // Calculate storage usage
    const tempPath = config.get('storage.tempPath');
    const archivePath = config.get('storage.archivePath');
    
    let storageUsage = '0MB';
    
    try {
      const tempSize = await getFolderSize(tempPath);
      const archiveSize = await getFolderSize(archivePath);
      const totalSize = tempSize + archiveSize;
      
      // Convert bytes to MB
      storageUsage = `${Math.round(totalSize / (1024 * 1024))}MB`;
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
    
    // Get blockchain information
    const networkInfo = await blockchainService.getNetworkInfo();
    
    res.status(200).json({
      aggregationService: 'Online',
      batchesProcessed,
      lastProcessed,
      storageUsage,
      blockchain: {
        network: networkInfo.network,
        lastRoot,
        latestBatchId
      }
    });
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({ error: 'Error getting system status' });
  }
});

// Helper function to calculate folder size recursively
async function getFolderSize(folderPath) {
  let totalSize = 0;
  
  // Check if folder exists
  if (!await fs.pathExists(folderPath)) {
    return 0;
  }
  
  // Get all files and subdirectories
  const items = await fs.readdir(folderPath);
  
  for (const item of items) {
    const itemPath = path.join(folderPath, item);
    const stats = await fs.stat(itemPath);
    
    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      totalSize += await getFolderSize(itemPath);
    }
  }
  
  return totalSize;
}

module.exports = router;

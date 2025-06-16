/**
 * Force Status Update Script
 * 
 * This script forces a refresh of the system status by directly updating the batch info
 */
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// Configuration
const API_URL = 'https://blockchain-log-production.up.railway.app/api';
const AUTH = {
  username: 'admin',
  password: 'changeme'
};

// Archive path
const archivePath = path.join(__dirname, 'log-archive', 'archive');

async function forceStatusUpdate() {
  try {
    console.log('Force updating system status...');
    
    // Get current batches from API
    console.log('Getting current batches from API...');
    const response = await axios.get(`${API_URL}/batches`, {
      auth: AUTH
    });
    
    console.log(`Retrieved ${response.data.batches?.length || 0} batches`);
    console.log(JSON.stringify(response.data.batches, null, 2));
    
    // Get local batches from directory
    console.log('\nGetting local batches from directory...');
    const directories = await fs.readdir(archivePath);
    const batchDirs = directories.filter(dir => dir.startsWith('batch_'));
    
    console.log(`Found ${batchDirs.length} batch directories:`);
    console.log(batchDirs);
    
    // Check if we need to process local batch directories
    if (batchDirs.length > 0) {
      console.log('\nProcessing local batch directories...');
      
      for (const batchDir of batchDirs) {
        const batchPath = path.join(archivePath, batchDir);
        const metadataPath = path.join(batchPath, 'metadata.json');
        
        if (await fs.pathExists(metadataPath)) {
          try {
            const metadata = await fs.readJson(metadataPath);
            console.log(`\nFound batch ${metadata.batchId}:`);
            console.log(JSON.stringify(metadata, null, 2));
            
            // Check if this batch exists in the API response
            const existingBatch = response.data.batches?.find(batch => batch.batchId === metadata.batchId);
            
            if (!existingBatch) {
              console.log(`\nBatch ${metadata.batchId} not found in API response. This may be the missing batch.`);
              
              // Force recreate the entire batch directory to ensure it's detected
              console.log(`Recreating batch ${metadata.batchId} directory to ensure it's detected...`);
              
              // Get logs and proofs if they exist
              const logsPath = path.join(batchPath, 'logs.json');
              const proofsPath = path.join(batchPath, 'proofs.json');
              
              let logs = [];
              let proofs = {};
              
              if (await fs.pathExists(logsPath)) {
                logs = await fs.readJson(logsPath);
              }
              
              if (await fs.pathExists(proofsPath)) {
                proofs = await fs.readJson(proofsPath);
              }
              
              // Create a temporary directory
              const tempDir = path.join(archivePath, `batch_${metadata.batchId}_temp`);
              await fs.ensureDir(tempDir);
              
              // Write files to temporary directory
              await fs.writeJson(path.join(tempDir, 'metadata.json'), metadata, { spaces: 2 });
              await fs.writeJson(path.join(tempDir, 'logs.json'), logs, { spaces: 2 });
              await fs.writeJson(path.join(tempDir, 'proofs.json'), proofs, { spaces: 2 });
              
              // Delete original directory
              await fs.remove(batchPath);
              
              // Rename temporary directory to original name
              await fs.rename(tempDir, batchPath);
              
              console.log(`Successfully recreated batch ${metadata.batchId} directory`);
            }
          } catch (error) {
            console.error(`Error processing metadata for ${batchDir}:`, error);
          }
        } else {
          console.log(`No metadata found for ${batchDir}`);
        }
      }
    }
    
    // Try to force backend to refresh by hitting the status endpoint
    console.log('\nForcing backend to refresh status...');
    const statusResponse = await axios.get(`${API_URL}/status?forceRefresh=true&t=${Date.now()}`, {
      auth: AUTH,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Status response:');
    console.log(JSON.stringify(statusResponse.data, null, 2));
    
    console.log('\nForce update complete. Try refreshing the dashboard now.');
    
  } catch (error) {
    console.error('Error forcing status update:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the function
forceStatusUpdate();

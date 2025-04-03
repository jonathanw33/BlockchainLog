import axios from 'axios';

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to use simulation mode when API is unavailable
let useSimulationMode = false;

// Simulated data for testing
let simulatedData = {
  // Sample batch data
  batches: [
    {
      batchId: 166,
      timestamp: "2025-03-31T15:30:00Z",
      merkleRoot: "0x0f2a469af6bd6813aec525023729188d68e12d8d94e2dc0a5422fc0e0cfb7201",
      logCount: 3,
      timeRange: {
        start: "2025-03-31T10:00:00Z", 
        end: "2025-03-31T10:02:00Z"
      }
    },
    {
      batchId: 165,
      timestamp: "2025-03-31T15:25:00Z",
      merkleRoot: "0x3a8e429ae45c32b1c3d373e42dcb2456c093a37bd94b2c905f67a7c15339725a",
      logCount: 5,
      timeRange: {
        start: "2025-03-31T09:50:00Z", 
        end: "2025-03-31T09:55:00Z"
      }
    }
  ],
  
  // Sample logs
  logs: [
    {
      id: 'log_1',
      timestamp: "2025-03-31T10:00:00Z",
      level: 'INFO',
      message: 'User alice logged in successfully',
      source: 'auth-service',
      batchId: 166
    },
    {
      id: 'log_2',
      timestamp: "2025-03-31T10:01:00Z",
      level: 'WARN',
      message: 'High memory usage detected: 85%',
      source: 'monitor-service',
      batchId: 166
    },
    {
      id: 'log_3',
      timestamp: "2025-03-31T10:02:00Z",
      level: 'ERROR',
      message: 'Failed to connect to database',
      source: 'db-service',
      batchId: 166
    }
  ],
  
  // System status
  systemStatus: {
    aggregationService: 'Online',
    batchesProcessed: 3,
    lastProcessed: new Date().toISOString(),
    storageUsage: '42MB',
    blockchain: {
      network: 'Sepolia Testnet (simulated)',
      lastRoot: '0x0f2a469af6bd6813aec525023729188d68e12d8d94e2dc0a5422fc0e0cfb7201',
      latestBatchId: 166
    }
  }
};

// Used to trigger refreshes when simulation data changes
let simulationDataVersion = 1;

// Force simulation mode (used for generated logs)
const forceSimulationMode = () => {
  console.log('Forcing simulation mode for generated logs');
  useSimulationMode = true;
};

// Reset simulation mode (used for switching to existing logs)
const resetSimulationMode = () => {
  console.log('Resetting simulation mode, will use real backend data');
  useSimulationMode = false;
};

// Update the entire simulated dataset
const updateSimulatedData = (newData) => {
  console.log('Updating simulated data:', newData);
  
  if (newData.logs) {
    simulatedData.logs = [...newData.logs];
  }
  
  if (newData.batches) {
    simulatedData.batches = [...newData.batches];
  }
  
  if (newData.systemStatus) {
    simulatedData.systemStatus = {...newData.systemStatus};
  }
  
  // Increment version to trigger refreshes
  simulationDataVersion++;
  
  console.log('Updated simulation data. New version:', simulationDataVersion);
  console.log('New log count:', simulatedData.logs.length);
  console.log('New batch count:', simulatedData.batches.length);
};

// Get a simulated verification result
const getSimulatedVerification = (log, batchId) => {
  // Find the batch (use specified batchId or find one)
  const targetBatchId = batchId || (simulatedData.batches.length > 0 ? simulatedData.batches[0].batchId : 166);
  const batch = simulatedData.batches.find(b => b.batchId === targetBatchId) || simulatedData.batches[0];
  
  // Check if the log is in our simulated logs
  const knownLog = simulatedData.logs.find(l => 
    l.timestamp === log.timestamp && 
    l.level === log.level && 
    l.message === log.message && 
    l.source === log.source
  );
  
  // If it's a known log, mark as valid, otherwise invalid
  const isValid = !!knownLog;
  
  return {
    status: 'success',
    verified: isValid,
    log: log,
    batchId: batch?.batchId || targetBatchId,
    merkleRoot: batch?.merkleRoot || '0x0',
    blockchainTimestamp: batch ? new Date(batch.timestamp).getTime() / 1000 : Math.floor(Date.now() / 1000)
  };
};

// Handle errors and switch to simulation mode if API is unavailable
const handleApiError = (error, fallbackData) => {
  console.error('API Error:', error);
  
  // If this is the first error, switch to simulation mode
  if (!useSimulationMode) {
    console.log('Switching to simulation mode due to API unavailability');
    useSimulationMode = true;
  }
  
  return fallbackData;
};

// API service methods
export const api = {
  // Simulation control
  forceSimulationMode,
  resetSimulationMode,
  updateSimulatedData,
  get simulatedData() { return simulatedData; },
  
  // Batch related methods
  getBatches: async () => {
    if (useSimulationMode) {
      console.log(`Getting batches (simulation mode). Data version: ${simulationDataVersion}`);
      console.log(`Batch count: ${simulatedData.batches.length}`);
      return [...simulatedData.batches];
    }
    
    try {
      const response = await apiClient.get('/batches');
      return response.data;
    } catch (error) {
      return handleApiError(error, [...simulatedData.batches]);
    }
  },
  
  getBatchInfo: async (batchId) => {
    if (useSimulationMode) {
      console.log(`Getting batch info (simulation mode). Batch ID: ${batchId}, Data version: ${simulationDataVersion}`);
      const batch = simulatedData.batches.find(b => b.batchId === batchId);
      return batch ? {...batch} : (simulatedData.batches.length > 0 ? {...simulatedData.batches[0]} : null);
    }
    
    try {
      const response = await apiClient.get(`/batches/${batchId}`);
      return response.data;
    } catch (error) {
      const batch = simulatedData.batches.find(b => b.batchId === batchId);
      return handleApiError(error, batch ? {...batch} : (simulatedData.batches.length > 0 ? {...simulatedData.batches[0]} : null));
    }
  },
  
  // Verification methods
  verifyLog: async (log, batchId = null) => {
    if (useSimulationMode) {
      console.log(`Verifying log (simulation mode). Data version: ${simulationDataVersion}`);
      return getSimulatedVerification(log, batchId);
    }
    
    try {
      const payload = { log };
      if (batchId) {
        payload.batchId = batchId;
      }
      
      const response = await apiClient.post('/verify', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error, getSimulatedVerification(log, batchId));
    }
  },
  
  // Get recent logs (demo or real)
  getRecentLogs: async () => {
    if (useSimulationMode) {
      console.log(`Getting recent logs (simulation mode). Data version: ${simulationDataVersion}`);
      console.log(`Log count: ${simulatedData.logs.length}`);
      return [...simulatedData.logs];
    }
    
    try {
      const response = await apiClient.get('/logs/recent');
      
      // Handle both the old and new response formats
      // New format returns an object with logs array, old format returns array directly
      const data = response.data;
      
      // Check if the response is the new format (an object with a logs property)
      if (data && typeof data === 'object' && Array.isArray(data.logs)) {
        console.log(`Received ${data.logs.length} logs from API (new format)`);
        return data.logs;
      }
      
      // Otherwise assume it's the old format (direct array)
      console.log(`Received ${Array.isArray(data) ? data.length : 0} logs from API (old format)`);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return handleApiError(error, [...simulatedData.logs]);
    }
  },
  
  // Get system status
  getSystemStatus: async () => {
    if (useSimulationMode) {
      console.log(`Getting system status (simulation mode). Data version: ${simulationDataVersion}`);
      return {...simulatedData.systemStatus};
    }
    
    try {
      const response = await apiClient.get('/status');
      return response.data;
    } catch (error) {
      return handleApiError(error, {...simulatedData.systemStatus});
    }
  }
};

export default api;

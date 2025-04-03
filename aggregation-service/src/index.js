/**
 * Log Aggregation Service
 * 
 * Core backend service that processes logs and interacts with the blockchain
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const fs = require('fs-extra');
const path = require('path');

// Import custom utilities
const logger = require('./utils/logger');
const { errorMiddleware, notFoundMiddleware } = require('./utils/errorHandler');
const requestLogger = require('./utils/requestLogger');

// Default configuration
const defaultConfig = {
  server: {
    port: 3000
  },
  auth: {
    username: "admin",
    password: "changeme"
  },
  storage: {
    tempPath: "../log-archive/temp",
    archivePath: "../log-archive/archive"
  },
  processing: {
    batchIntervalMinutes: 5
  },
  blockchain: {
    provider: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    contractAddress: "YOUR_CONTRACT_ADDRESS",
    privateKey: "YOUR_PRIVATE_KEY"
  }
};

// Try to load configuration, fall back to default if it fails
let config;
try {
  config = require('config');
  logger.info('Loaded configuration from config file');
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
  logger.warn('Configuration file not found, using default configuration', { error: error.message });
}

// Import modules
const logApi = require('./api/logApi');
const statusApi = require('./api/statusApi');
const merkleProcessor = require('./merkle/merkleProcessor');
const blockchainService = require('./blockchain/blockchainService');
const storageService = require('./storage/storageService');

// Initialize Express app
const app = express();

// Configure CORS middleware
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080', 
          'https://blockchain-log-web.vercel.app', 'https://*.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Apply security middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for now (you can restrict this later)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply request parsing middleware with increased limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging middleware
app.use(requestLogger);

// Set up API routes
app.use('/api', logApi);
app.use('/api', statusApi);

// Root path handler
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Blockchain Log Integrity System API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/api/logs',
      '/api/verify',
      '/api/batches',
      '/api/status',
      '/health'
    ]
  });
});

// Health check endpoint with detailed system info
app.get('/health', (req, res) => {
  // Get memory usage
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  // Prepare health status
  const healthStatus = {
    status: 'healthy',
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    timestamp: new Date().toISOString(),
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
    },
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.status(200).json(healthStatus);
});

// Add 404 middleware for undefined routes
app.use(notFoundMiddleware);

// Add error handling middleware (must be last)
app.use(errorMiddleware);

// Initialize services
const init = async () => {
  try {
    // Ensure storage directories exist
    const tempStoragePath = config.get('storage.tempPath');
    const archivePath = config.get('storage.archivePath');
    
    logger.info('Ensuring storage directories exist', {
      tempPath: tempStoragePath,
      archivePath: archivePath
    });
    
    await fs.ensureDir(tempStoragePath);
    await fs.ensureDir(archivePath);
    
    // Schedule batch processing
    const batchInterval = config.get('processing.batchIntervalMinutes');
    logger.info(`Scheduling batch processing every ${batchInterval} minutes`);
    
    // Create scheduler for batch processing
    const job = schedule.scheduleJob(`*/${batchInterval} * * * *`, async () => {
      logger.info('Starting scheduled batch processing');
      try {
        await processBatch();
      } catch (error) {
        logger.error('Error during batch processing', {
          error: error.message,
          stack: error.stack
        });
      }
    });
    
    // Log the next scheduled run
    if (job) {
      logger.info(`Next batch processing scheduled for ${job.nextInvocation().toDate().toISOString()}`);
    } else {
      logger.warn('Failed to schedule batch processing job');
    }
    
    logger.info('Services initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize services', {
      error: error.message,
      stack: error.stack
    });
    throw error; // Re-throw to be caught by caller
  }
};

// Batch processing function
const processBatch = async () => {
  const batchStartTime = Date.now();
  logger.info('Starting log batch processing');
  
  try {
    // 1. Collect logs from temporary storage
    logger.debug('Collecting logs from temporary storage');
    const logs = await storageService.getLogsForProcessing();
    
    if (logs.length === 0) {
      logger.info('No logs to process in this batch');
      return;
    }
    
    logger.info(`Processing batch with ${logs.length} logs`);
    
    // 2. Create Merkle tree
    logger.debug('Creating Merkle tree from logs');
    const { merkleRoot, merkleProofs, logs: processedLogs } = await merkleProcessor.processBatch(logs);
    logger.info(`Generated Merkle root: ${merkleRoot}`);
    
    // 3. Store root on blockchain
    logger.debug('Storing Merkle root on blockchain');
    const batchId = await blockchainService.storeMerkleRoot(merkleRoot);
    logger.info(`Stored Merkle root with batch ID: ${batchId}`);
    
    // 4. Store processed logs with proofs
    logger.debug('Archiving processed logs with proofs');
    await storageService.archiveBatch(batchId, processedLogs, merkleProofs, merkleRoot);
    
    // Calculate and log processing time
    const processingTime = (Date.now() - batchStartTime) / 1000;
    
    logger.info(`Batch ${batchId} processed successfully`, {
      batchId,
      logCount: logs.length,
      processingTime: `${processingTime.toFixed(2)}s`,
      merkleRoot
    });
    
    return batchId;
  } catch (error) {
    logger.error('Failed to process log batch', {
      error: error.message,
      stack: error.stack,
      processingTime: `${((Date.now() - batchStartTime) / 1000).toFixed(2)}s`
    });
    throw error; // Re-throw for the scheduler to catch
  }
};

// Start server
const PORT = config.get('server.port') || 3000;

// Only start the server if this is the main module
if (require.main === module) {
  // Handle any uncaught exceptions to prevent server crash
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack
    });
    // Keep the process alive but log the issue
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack
    });
    // Keep the process alive but log the issue
  });
  
  // Start the server
  const server = app.listen(PORT, async () => {
    logger.info(`Log Aggregation Service running on port ${PORT}`);
    
    try {
      await init();
      logger.info(`Service startup complete`);
    } catch (error) {
      logger.error('Failed to initialize service components', {
        error: error.message,
        stack: error.stack
      });
    }
  });
  
  // Graceful shutdown
  const gracefulShutdown = () => {
    logger.info('Received shutdown signal, closing server...');
    
    server.close(() => {
      logger.info('Server closed, exiting process');
      process.exit(0);
    });
    
    // Force close after 10 seconds if still not closed
    setTimeout(() => {
      logger.error('Server could not close in time, forcing shutdown');
      process.exit(1);
    }, 10000);
  };
  
  // Listen for termination signals
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

// Export for testing
module.exports = { app, processBatch, init };

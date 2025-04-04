/**
 * Log API
 * 
 * API endpoints for log ingestion and verification
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Import services
const storageService = require('../storage/storageService');
const merkleProcessor = require('../merkle/merkleProcessor');
const blockchainService = require('../blockchain/blockchainService');

// Import utilities
const logger = require('../utils/logger');
const { asyncHandler, badRequest, notFound } = require('../utils/errorHandler');

// Default configuration
const defaultConfig = {
  auth: {
    username: "admin",
    password: "changeme"
  }
};

// Try to load configuration, fall back to default if it fails
let config;
try {
  config = require('config');
  logger.info('API: Loaded configuration from config file');
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
  logger.warn('API: Configuration file not found, using default configuration', { error: error.message });
}

// Basic authentication middleware
const basicAuth = (req, res, next) => {
  try {
    // Get auth credentials
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      logger.warn('Authentication attempt with missing or invalid Authorization header', {
        ip: req.ip,
        path: req.path
      });
      throw badRequest('Authentication required', { type: 'missing_auth_header' });
    }
    
    // Extract credentials
    const base64Credentials = authHeader.split(' ')[1];
    
    if (!base64Credentials) {
      logger.warn('Authentication attempt with empty credentials', {
        ip: req.ip,
        path: req.path
      });
      throw badRequest('Invalid authorization format', { type: 'invalid_auth_format' });
    }
    
    let credentials;
    try {
      credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    } catch (error) {
      logger.warn('Failed to decode base64 credentials', {
        ip: req.ip,
        path: req.path,
        error: error.message
      });
      throw badRequest('Invalid authorization encoding', { type: 'invalid_encoding' });
    }
    
    const parts = credentials.split(':');
    
    if (parts.length !== 2) {
      logger.warn('Invalid credential format (missing username or password)', {
        ip: req.ip,
        path: req.path
      });
      throw badRequest('Invalid credentials format', { type: 'invalid_format' });
    }
    
    const [username, password] = parts;
    
    // Check against config
    const configUsername = config.get('auth.username');
    const configPassword = config.get('auth.password');
    
    if (username !== configUsername || password !== configPassword) {
      logger.warn('Authentication attempt with invalid credentials', {
        ip: req.ip,
        path: req.path,
        username
      });
      throw badRequest('Invalid credentials', { type: 'invalid_credentials' });
    }
    
    // Add user info to request for potential later use
    req.user = { username };
    
    logger.debug('Authentication successful', {
      user: username,
      ip: req.ip,
      path: req.path
    });
    
    next();
  } catch (error) {
    // Set the status code from the error if available, or default to 401
    res.status(error.statusCode || 401).json({
      status: 'error',
      message: error.message || 'Authentication failed',
      context: error.context
    });
  }
};

// Ingest logs endpoint
router.post('/logs', basicAuth, asyncHandler(async (req, res) => {
  // Ensure request body exists
  if (!req.body) {
    throw badRequest('Request body is empty');
  }
  
  // Convert single log to array if needed
  const logs = Array.isArray(req.body) ? req.body : [req.body];
  
  logger.debug(`Processing ${logs.length} logs for ingestion`, {
    requestSize: JSON.stringify(req.body).length,
    logCount: logs.length
  });
  
  // Validate logs and capture validation errors
  const validLogs = [];
  const invalidLogs = [];
  
  logs.forEach((log, index) => {
    // Check required fields
    if (!log || !log.timestamp || !log.level || !log.message || !log.source) {
      invalidLogs.push({
        index,
        log,
        reason: 'Missing required fields (timestamp, level, message, source)'
      });
      return;
    }
    
    // Validate timestamp format (ISO 8601)
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(log.timestamp)) {
      invalidLogs.push({
        index,
        log,
        reason: 'Invalid timestamp format, must be ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)'
      });
      return;
    }
    
    // Validate log level (common levels)
    const validLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    if (!validLevels.includes(log.level.toUpperCase())) {
      // We'll accept it but normalize the level
      log.level = log.level.toUpperCase();
      // Add warning to response
    }
    
    // Validate message and source are not too long
    if (log.message.length > 10000) {
      invalidLogs.push({
        index,
        log: { ...log, message: log.message.substring(0, 100) + '...' }, // Truncate for log
        reason: 'Message too long (max 10000 characters)'
      });
      return;
    }
    
    if (log.source.length > 200) {
      invalidLogs.push({
        index,
        log,
        reason: 'Source too long (max 200 characters)'
      });
      return;
    }
    
    // Log passes validation
    validLogs.push(log);
  });
  
  // Log validation results
  if (invalidLogs.length > 0) {
    logger.warn(`Found ${invalidLogs.length} invalid logs in request`, {
      invalidCount: invalidLogs.length,
      validCount: validLogs.length,
      samples: invalidLogs.slice(0, 3) // Log up to 3 invalid examples
    });
  }
  
  // Handle case where no valid logs found
  if (validLogs.length === 0) {
    throw badRequest('No valid logs found in request', {
      invalidCount: invalidLogs.length,
      invalidReasons: invalidLogs.map(l => l.reason).slice(0, 5)
    });
  }
  
  // Store logs
  logger.info(`Storing ${validLogs.length} valid logs`);
  await storageService.storeIncomingLogs(validLogs);
  
  // Prepare response
  const response = { 
    status: 'success', 
    message: `Received ${validLogs.length} logs`,
    validCount: validLogs.length,
    totalCount: logs.length
  };
  
  // Add warning about invalid logs if any
  if (invalidLogs.length > 0) {
    response.warning = `${invalidLogs.length} logs were invalid and not processed`;
    response.invalidCount = invalidLogs.length;
    
    // In debug mode, include details about invalid logs
    if (process.env.NODE_ENV !== 'production') {
      response.invalidSamples = invalidLogs.slice(0, 3);
    }
  }
  
  res.status(200).json(response);
}));

// Verify log endpoint
router.post('/verify', asyncHandler(async (req, res) => {
  const { log, batchId } = req.body;
  const requestId = uuidv4();
  
  try {
  
  // Start verification timer
  const verificationStart = Date.now();
  
  // Initial verification request logging with request ID for tracking
  logger.info(`Starting log verification`, {
    requestId,
    hasBatchId: !!batchId,
    logDetails: log ? {
      timestamp: log.timestamp,
      level: log.level,
      source: log.source,
      messageSample: log.message ? log.message.substring(0, 30) + (log.message.length > 30 ? '...' : '') : null
    } : null
  });
  
  // Validate log data
  if (!log) {
    throw badRequest('Log data is required', { requestId });
  }
  
  // Validate required log fields
  if (!log.timestamp || !log.level || !log.message || !log.source) {
    throw badRequest('Log must include timestamp, level, message, and source fields', {
      requestId,
      missingFields: Object.entries({
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        source: log.source
      }).filter(([k, v]) => !v).map(([k]) => k)
    });
  }
  
  // Find the batch that contains this log
  let targetBatchId = batchId;
  let logEntry = null;
  let proof = null;
  let searchError = null;
  
  // If batch ID not provided or is 0, search for the log
  // Note: We treat batchId === 0 as a valid batch ID now
  if (targetBatchId === undefined || targetBatchId === null) {
    logger.debug(`No batch ID provided, searching for log in all batches`, { requestId });
    
    // Use a stricter search to ensure we get the correct batch
    // This helps avoid cross-batch verification issues
    const searchResult = await storageService.findBatchContainingLog(log);
    targetBatchId = searchResult?.batchId;
    
    if (!targetBatchId) {
      searchError = 'Log not found in any batch';
      logger.warn(`${searchError}`, {
        requestId,
        logTimestamp: log.timestamp,
        logSource: log.source
      });
      // Don't throw yet - we'll create a more detailed error response
    } else {
      logger.debug(`Found log in batch ${targetBatchId}`, { requestId });
    }
  }
  
  // If we have a batch ID, try to get the log and proof
  if (targetBatchId && !searchError) {
    // Get the log entry and its proof from storage
    logger.debug(`Retrieving log and proof from batch ${targetBatchId}`, { requestId });
    
    try {
      // Attempt to find the best matching log instead of requiring exact match
      const result = await storageService.getLogAndProof(targetBatchId, log, true); // Added 'true' for fuzzy matching
      logEntry = result.logEntry;
      proof = result.proof;
      
      if (!logEntry || !proof) {
        searchError = 'Log or proof not found in specified batch';
        logger.warn(`${searchError}`, {
          requestId,
          batchId: targetBatchId,
          hasLogEntry: !!logEntry,
          hasProof: !!proof
        });
      }
    } catch (err) {
      searchError = err.message || 'Error retrieving log and proof';
      logger.warn(`${searchError}`, {
        requestId,
        batchId: targetBatchId,
        error: err.message
      });
    }
  }
  
  // If we couldn't find the log or proof, create a detailed response instead of throwing
  if (searchError) {
    // Build a structured verification failure response instead of throwing an error
    const errorResponse = {
      status: 'error',
      requestId,
      verified: false,
      error: searchError,
      log: null,
      requestedLog: log,
      batchId: targetBatchId,
      verificationTimeMs: Date.now() - verificationStart,
      failureReason: {
        type: 'LOG_NOT_FOUND',
        description: 'The requested log could not be found in the system'
      },
      diagnosticInfo: {
        error: searchError,
        requestedLog: {
          timestamp: log.timestamp,
          level: log.level,
          message: log.message,
          source: log.source
        }
      }
    };
    
    logger.info(`Verification failed: LOG_NOT_FOUND`, {
      requestId,
      batchId: targetBatchId,
      verificationTimeMs: Date.now() - verificationStart
    });
    
    return res.status(200).json(errorResponse);
  }
  
  // Get the Merkle root from blockchain
  logger.debug(`Retrieving Merkle root for batch ${targetBatchId}`, { requestId });
  const { root, timestamp } = await blockchainService.getMerkleRoot(targetBatchId);
  
  if (!root) {
    logger.error(`Failed to retrieve Merkle root for batch ${targetBatchId}`, {
      requestId,
      batchId: targetBatchId
    });
    throw new Error(`Failed to retrieve Merkle root for batch ${targetBatchId}`);
  }
  
  // Log verification details for debugging
  logger.debug(`Verification request details`, {
    requestId,
    batchId: targetBatchId,
    originalLog: log,
    foundLogEntry: logEntry,
    merkleRoot: root
  });
  
  // Verify the log
  logger.debug(`Verifying log against Merkle root`, { requestId });
  
  const verificationResult = merkleProcessor.verifyLog(logEntry, proof, root);
  
  // Calculate verification time
  const verificationTime = Date.now() - verificationStart;
  
  // Calculate hashes for the requested log and the found log
  const requestedLogHash = Buffer.from(JSON.stringify({
    timestamp: log.timestamp,
    level: log.level,
    message: log.message,
    source: log.source
  })).toString('hex').substring(0, 16) + '...';
  
  const foundLogHash = Buffer.from(JSON.stringify({
    timestamp: logEntry.timestamp,
    level: logEntry.level,
    message: logEntry.message,
    source: logEntry.source
  })).toString('hex').substring(0, 16) + '...';
  
  // Check for discrepancies in the log data
  const discrepancies = [];
  if (log.timestamp !== logEntry.timestamp) discrepancies.push('timestamp');
  if (log.level !== logEntry.level) discrepancies.push('level');
  if (log.message !== logEntry.message) discrepancies.push('message');
  if (log.source !== logEntry.source) discrepancies.push('source');
  
  // Determine verification status
  // If there are discrepancies, force failure regardless of cryptographic result
  let isValid = verificationResult.verified;
  if (discrepancies.length > 0) {
    logger.info(`Forcing verification failure due to log content discrepancies`, {
      requestId,
      discrepancies
    });
    isValid = false;
  }
  
  // Log verification result with timing
  logger.info(`Verification complete: ${isValid ? 'VALID' : 'INVALID'}`, {
    requestId,
    isValid,
    reason: verificationResult.reason || (discrepancies.length > 0 ? 'LOG_CONTENT_MISMATCH' : null),
    verificationTimeMs: verificationTime,
    batchId: targetBatchId
  });
  
  // Enhanced response with failure reason
  let failureReason = null;
  if (!isValid) {
    if (discrepancies.length > 0) {
      // If there are content discrepancies, this is the primary failure reason
      failureReason = {
        type: 'LOG_CONTENT_MISMATCH',
        description: 'The log content does not match what was recorded in the system',
        details: {
          discrepancies,
          requestedLog: {
            timestamp: log.timestamp,
            level: log.level,
            message: log.message,
            source: log.source
          },
          storedLog: {
            timestamp: logEntry.timestamp,
            level: logEntry.level,
            message: logEntry.message,
            source: logEntry.source
          }
        }
      };
    } else if (verificationResult.reason) {
      // Use the detailed reason from the merkle processor if no content discrepancies
      failureReason = {
        type: verificationResult.reason,
        description: getFailureDescription(verificationResult.reason),
        details: verificationResult.details || {}
      };
    }
  }
  
  // Prepare detailed verification steps for frontend visualization
  const verificationSteps = [
    {
      id: 'parse',
      name: 'Log Parsing',
      status: 'success',
      details: {
        requestedLog: log,
        normalizedLog: {
          timestamp: log.timestamp,
          level: log.level,
          message: log.message,
          source: log.source
        }
      }
    },
    {
      id: 'batch',
      name: 'Batch Identification',
      status: 'success',
      details: {
        batchId: targetBatchId,
        searchStrategy: batchId ? 'direct' : 'search',
        timeRange: {
          start: new Date(logEntry.timestamp).toISOString(),
          batchTimestamp: timestamp
        }
      }
    },
    {
      id: 'content',
      name: 'Content Validation',
      status: discrepancies.length > 0 ? 'failed' : 'success',
      details: {
        discrepancies: discrepancies.length > 0 ? discrepancies.map(field => ({
          field,
          expected: logEntry[field],
          received: log[field]
        })) : [],
        contentMatch: discrepancies.length === 0
      }
    },
    {
      id: 'merkle',
      name: 'Merkle Proof Verification',
      status: verificationResult.verified ? 'success' : 'failed',
      details: {
        merkleRoot: root,
        proofLength: proof ? proof.length : 0,
        verified: verificationResult.verified,
        reason: verificationResult.reason
      }
    }
  ];
  
  // Prepare and send response with enhanced verification details
  res.status(200).json({
    status: 'success',
    requestId,
    verified: isValid,
    log: logEntry,
    requestedLog: discrepancies.length > 0 ? log : null, // Include the requested log if it differs
    batchId: targetBatchId,
    merkleRoot: root,
    blockchainTimestamp: timestamp,
    verificationTimeMs: verificationTime,
    failureReason,
    verificationSteps, // Add detailed steps for visualization
    diagnosticInfo: {
      requestedLogHash,
      foundLogHash,
      ...(discrepancies.length > 0 && { 
        discrepancies,
        note: 'Differences between requested log and stored log'
      })
    }
  });
  
} catch (error) {
  // Improved error handling to prevent terminal from stopping
  logger.error(`Error during verification process`, {
    requestId,
    error: error.message,
    stack: error.stack
  });
  
  // Return error response
  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'An unexpected error occurred during verification',
    requestId
  });
}
}));

// Get batch info endpoint
router.get('/batches/:batchId', asyncHandler(async (req, res) => {
  const batchId = parseInt(req.params.batchId);
  
  // Validate batch ID
  if (isNaN(batchId) || batchId <= 0) {
    logger.warn(`Invalid batch ID requested: ${req.params.batchId}`, {
      ip: req.ip,
      path: req.path
    });
    throw badRequest('Invalid batch ID. Must be a positive integer.', {
      providedValue: req.params.batchId
    });
  }
  
  logger.debug(`Retrieving info for batch ${batchId}`);
  
  // Get batch info
  const batchInfo = await storageService.getBatchInfo(batchId);
  
  if (!batchInfo) {
    logger.warn(`Batch not found: ${batchId}`, {
      batchId
    });
    throw notFound(`Batch ${batchId} not found`);
  }
  
  // Add additional metadata
  const responseData = {
    ...batchInfo,
    retrievedAt: new Date().toISOString()
  };
  
  // Calculate and add age
  if (batchInfo.timestamp) {
    const batchDate = new Date(batchInfo.timestamp);
    const now = new Date();
    const ageMs = now - batchDate;
    
    responseData.age = {
      ms: ageMs,
      seconds: Math.floor(ageMs / 1000),
      minutes: Math.floor(ageMs / 60000),
      hours: Math.floor(ageMs / 3600000),
      days: Math.floor(ageMs / 86400000)
    };
  }
  
  logger.debug(`Successfully retrieved batch ${batchId} info`);
  res.status(200).json(responseData);
}));

// Get batches list endpoint
router.get('/batches', asyncHandler(async (req, res) => {
  // Get optional query parameters for pagination and filtering
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const sortBy = req.query.sortBy || 'timestamp';
  const sortOrder = req.query.sortOrder || 'desc';
  
  // Validate pagination parameters
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw badRequest('Invalid limit parameter. Must be between 1 and 100.', {
      providedValue: req.query.limit
    });
  }
  
  if (isNaN(offset) || offset < 0) {
    throw badRequest('Invalid offset parameter. Must be a non-negative integer.', {
      providedValue: req.query.offset
    });
  }
  
  // Validate sort parameters
  const validSortFields = ['batchId', 'timestamp', 'logCount'];
  if (!validSortFields.includes(sortBy)) {
    throw badRequest(`Invalid sortBy parameter. Must be one of: ${validSortFields.join(', ')}.`, {
      providedValue: sortBy,
      validOptions: validSortFields
    });
  }
  
  const validSortOrders = ['asc', 'desc'];
  if (!validSortOrders.includes(sortOrder)) {
    throw badRequest(`Invalid sortOrder parameter. Must be one of: ${validSortOrders.join(', ')}.`, {
      providedValue: sortOrder,
      validOptions: validSortOrders
    });
  }
  
  logger.debug(`Listing batches with pagination`, {
    limit,
    offset,
    sortBy,
    sortOrder
  });
  
  // Get all batches
  const allBatches = await storageService.listBatches();
  
  // Sort batches
  const sortedBatches = [...allBatches].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Special handling for timestamp (convert to Date)
    if (sortBy === 'timestamp') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Sort ascending or descending
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // Apply pagination
  const paginatedBatches = sortedBatches.slice(offset, offset + limit);
  
  // Create response with pagination metadata
  const response = {
    batches: paginatedBatches,
    pagination: {
      total: allBatches.length,
      limit,
      offset,
      returnedCount: paginatedBatches.length,
      hasMore: offset + paginatedBatches.length < allBatches.length
    },
    sort: {
      field: sortBy,
      order: sortOrder
    }
  };
  
  logger.debug(`Retrieved ${paginatedBatches.length} batches from total of ${allBatches.length}`);
  res.status(200).json(response);
}));

// Helper function to get human-friendly descriptions for verification failures
function getFailureDescription(reasonCode) {
  const descriptions = {
    'LOG_HASH_MISMATCH': 'The log content has been modified after it was originally recorded',
    'INVALID_MERKLE_ROOT': 'The Merkle root stored on the blockchain is invalid or corrupted',
    'MERKLE_PROOF_INVALID': 'The cryptographic proof is valid but doesn\'t match the blockchain record',
    'VERIFICATION_ERROR': 'An error occurred during the verification process',
    'VERIFICATION_PROCESS_ERROR': 'An unexpected error occurred while verifying the log',
    'LOG_CONTENT_MISMATCH': 'The log content does not match what was recorded in the system'
  };
  
  return descriptions[reasonCode] || 'Verification failed for an unknown reason';
}

// Import recent logs handler
const getRecentLogs = require('./recent-logs');

// Get recent logs endpoint
router.get('/logs/recent', (req, res) => getRecentLogs(req, res, storageService));

module.exports = router;

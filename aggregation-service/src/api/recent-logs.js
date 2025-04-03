/**
 * Recent logs endpoint
 * 
 * Handles retrieving recent logs with filtering and pagination
 */

const { asyncHandler, badRequest } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Recent logs endpoint handler
const getRecentLogs = asyncHandler(async (req, res, storageService) => {
  // Get query parameters with defaults
  const limit = parseInt(req.query.limit) || 10;
  const source = req.query.source;
  const level = req.query.level;
  const since = req.query.since;
  const until = req.query.until;
  
  // Start performance measurement
  const startTime = Date.now();
  
  // Validate parameters
  if (isNaN(limit) || limit <= 0 || limit > 100) {
    throw badRequest('Invalid limit parameter. Must be between 1 and 100.', {
      providedValue: req.query.limit
    });
  }
  
  // Validate level if provided
  if (level && !['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'].includes(level.toUpperCase())) {
    throw badRequest('Invalid level parameter. Must be one of: ERROR, WARN, INFO, DEBUG, TRACE.', {
      providedValue: level
    });
  }
  
  // Validate date parameters if provided
  let sinceDate = null;
  let untilDate = null;
  
  if (since) {
    try {
      sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      throw badRequest('Invalid since parameter. Must be a valid ISO 8601 date.', {
        providedValue: since
      });
    }
  }
  
  if (until) {
    try {
      untilDate = new Date(until);
      if (isNaN(untilDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      throw badRequest('Invalid until parameter. Must be a valid ISO 8601 date.', {
        providedValue: until
      });
    }
  }
  
  // Log the search parameters
  logger.debug('Getting recent logs with filters', {
    limit,
    source: source || 'any',
    level: level || 'any',
    since: since || 'any',
    until: until || 'any'
  });
  
  // Get all batches
  const batches = await storageService.listBatches();
  
  if (batches.length === 0) {
    logger.info('No batches found when retrieving recent logs');
    return res.status(200).json({
      logs: [],
      count: 0,
      filters: {
        limit,
        source: source || null,
        level: level || null,
        since: since || null,
        until: until || null
      }
    });
  }
  
  // Sort batches by timestamp (descending)
  const sortedBatches = batches.sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // Get logs from the most recent batches
  const recentLogs = [];
  let logsNeeded = limit;
  let batchesProcessed = 0;
  let logsProcessed = 0;
  
  for (const batch of sortedBatches) {
    if (logsNeeded <= 0) break;
    batchesProcessed++;
    
    // Skip batch if outside date range
    if (sinceDate && new Date(batch.timeRange.end) < sinceDate) {
      continue;
    }
    
    if (untilDate && new Date(batch.timeRange.start) > untilDate) {
      continue;
    }
    
    const batchLogs = await storageService.getBatchLogs(batch.batchId);
    logsProcessed += batchLogs.length;
    
    // Add batch ID to each log and generate a unique ID
    const logsWithMetadata = batchLogs.map(log => ({
      ...log,
      id: uuidv4(),
      batchId: batch.batchId
    }));
    
    // Apply filters
    let filteredLogs = logsWithMetadata;
    
    // Filter by source if specified
    if (source) {
      filteredLogs = filteredLogs.filter(log => 
        log.source.toLowerCase().includes(source.toLowerCase())
      );
    }
    
    // Filter by level if specified
    if (level) {
      filteredLogs = filteredLogs.filter(log => 
        log.level.toUpperCase() === level.toUpperCase()
      );
    }
    
    // Filter by date range
    if (sinceDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= sinceDate
      );
    }
    
    if (untilDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= untilDate
      );
    }
    
    // Sort logs by timestamp (descending)
    const sortedLogs = filteredLogs.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Take only the logs we need
    const logsToAdd = sortedLogs.slice(0, logsNeeded);
    recentLogs.push(...logsToAdd);
    
    logsNeeded -= logsToAdd.length;
  }
  
  // Calculate query performance
  const queryTime = Date.now() - startTime;
  
  // Log performance
  logger.debug('Recent logs query completed', {
    found: recentLogs.length,
    batchesProcessed,
    logsProcessed,
    timeMs: queryTime
  });
  
  // Prepare response
  const response = {
    logs: recentLogs,
    count: recentLogs.length,
    meta: {
      batchesProcessed,
      logsProcessed,
      timeMs: queryTime
    },
    filters: {
      limit,
      source: source || null,
      level: level || null,
      since: since || null,
      until: until || null
    }
  };
  
  res.status(200).json(response);
});

module.exports = getRecentLogs;

/**
 * Logger Utility
 * 
 * Provides structured logging functionality with different severity levels
 * and contextual information.
 */

const fs = require('fs-extra');
const path = require('path');
const util = require('util');

// Define log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Default to INFO level, can be overridden via environment variable
const DEFAULT_LOG_LEVEL = process.env.LOG_LEVEL ? 
  (LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO) : 
  LOG_LEVELS.INFO;

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
fs.ensureDirSync(logsDir);

// File paths for different log types
const logFilePaths = {
  combined: path.join(logsDir, 'combined.log'),
  error: path.join(logsDir, 'error.log'),
  access: path.join(logsDir, 'access.log')
};

/**
 * Format log message with timestamp, level, and optional context
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} context - Additional contextual information
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  
  // Format context object 
  let contextStr = '';
  if (Object.keys(context).length > 0) {
    contextStr = util.inspect(context, { depth: 4, compact: true, breakLength: Infinity });
  }
  
  return `${timestamp} [${level.padEnd(5)}] ${message}${contextStr ? ' - ' + contextStr : ''}`;
}

/**
 * Write log entry to console and appropriate log files
 * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG, TRACE)
 * @param {string} message - Log message
 * @param {object} context - Additional contextual information
 */
function log(level, message, context = {}) {
  const levelValue = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  
  // Only log if the current level is enabled
  if (levelValue > DEFAULT_LOG_LEVEL) {
    return;
  }
  
  const formattedMessage = formatLogMessage(level, message, context);
  
  // Always write to combined log and console
  fs.appendFileSync(logFilePaths.combined, formattedMessage + '\n');
  
  // For ERROR and WARN levels, also write to error log
  if (level === 'ERROR' || level === 'WARN') {
    fs.appendFileSync(logFilePaths.error, formattedMessage + '\n');
  }
  
  // Console output with colors
  let consoleMethod, consoleColor;
  switch (level) {
    case 'ERROR':
      consoleMethod = 'error';
      consoleColor = '\x1b[31m'; // Red
      break;
    case 'WARN':
      consoleMethod = 'warn';
      consoleColor = '\x1b[33m'; // Yellow
      break;
    case 'INFO':
      consoleMethod = 'info';
      consoleColor = '\x1b[36m'; // Cyan
      break;
    case 'DEBUG':
      consoleMethod = 'debug';
      consoleColor = '\x1b[35m'; // Magenta
      break;
    case 'TRACE':
      consoleMethod = 'log';
      consoleColor = '\x1b[90m'; // Gray
      break;
    default:
      consoleMethod = 'log';
      consoleColor = '\x1b[0m'; // Default
  }
  
  console[consoleMethod](`${consoleColor}${formattedMessage}\x1b[0m`);
}

/**
 * Log access entry for API requests
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {number} responseTime - Response time in milliseconds
 */
function logAccess(req, res, responseTime) {
  const { method, url, ip, headers } = req;
  const userAgent = headers['user-agent'] || 'Unknown';
  const timestamp = new Date().toISOString();
  const statusCode = res.statusCode;
  
  const logEntry = `${timestamp} ${method} ${url} ${statusCode} ${responseTime}ms - ${ip} - ${userAgent}`;
  
  // Write to access log file
  fs.appendFileSync(logFilePaths.access, logEntry + '\n');
  
  // Also write to combined log and console if status is not 2xx or 3xx
  if (statusCode >= 400) {
    log('WARN', `Access: ${method} ${url} ${statusCode} ${responseTime}ms`, { ip });
  } else if (DEFAULT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
    // Only log successful requests in DEBUG or TRACE mode
    log('DEBUG', `Access: ${method} ${url} ${statusCode} ${responseTime}ms`, { ip });
  }
}

/**
 * Create an error object with additional context
 * @param {string} message - Error message
 * @param {object} context - Additional context
 * @param {Error} originalError - Original error if any
 * @returns {Error} Enhanced error object
 */
function createError(message, context = {}, originalError = null) {
  const error = new Error(message);
  error.context = context;
  
  if (originalError) {
    error.originalError = originalError;
    error.stack = `${error.stack}\nCaused by: ${originalError.stack}`;
  }
  
  return error;
}

// Convenience methods for different log levels
module.exports = {
  error: (message, context = {}) => log('ERROR', message, context),
  warn: (message, context = {}) => log('WARN', message, context),
  info: (message, context = {}) => log('INFO', message, context),
  debug: (message, context = {}) => log('DEBUG', message, context),
  trace: (message, context = {}) => log('TRACE', message, context),
  logAccess,
  createError,
  LOG_LEVELS
};

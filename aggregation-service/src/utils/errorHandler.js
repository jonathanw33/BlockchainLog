/**
 * Error Handler Middleware
 * 
 * Provides centralized error handling for the Express application
 */

const logger = require('./logger');

/**
 * Custom error class for API errors with status code and additional context
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a not found error
 * @param {string} message - Error message
 * @param {object} context - Additional context
 * @returns {ApiError} NotFound error
 */
function notFound(message = 'Resource not found', context = {}) {
  return new ApiError(message, 404, context);
}

/**
 * Create a bad request error
 * @param {string} message - Error message
 * @param {object} context - Additional context
 * @returns {ApiError} BadRequest error
 */
function badRequest(message = 'Bad request', context = {}) {
  return new ApiError(message, 400, context);
}

/**
 * Create an unauthorized error
 * @param {string} message - Error message
 * @param {object} context - Additional context
 * @returns {ApiError} Unauthorized error
 */
function unauthorized(message = 'Unauthorized', context = {}) {
  return new ApiError(message, 401, context);
}

/**
 * Create a forbidden error
 * @param {string} message - Error message
 * @param {object} context - Additional context
 * @returns {ApiError} Forbidden error
 */
function forbidden(message = 'Forbidden', context = {}) {
  return new ApiError(message, 403, context);
}

/**
 * Create an internal server error
 * @param {string} message - Error message
 * @param {object} context - Additional context
 * @returns {ApiError} InternalServerError
 */
function internalError(message = 'Internal server error', context = {}) {
  return new ApiError(message, 500, context);
}

/**
 * Error handling middleware for Express
 */
function errorMiddleware(err, req, res, next) {
  // Default status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Detailed error information to log (not all sent to client)
  const errorDetails = {
    path: req.path,
    method: req.method,
    statusCode,
    error: err.name || 'Error',
    context: err.context || {},
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  };
  
  // Log based on status code severity
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, errorDetails);
  } else if (statusCode >= 400) {
    logger.warn(`[${statusCode}] ${message}`, errorDetails);
  } else {
    logger.info(`[${statusCode}] ${message}`, errorDetails);
  }
  
  // Client response - sanitized for production
  const clientResponse = {
    status: 'error',
    statusCode,
    message,
    // Only include context in non-production environments or for non-500 errors
    ...(process.env.NODE_ENV !== 'production' || statusCode < 500) && { 
      context: err.context || {},
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    }
  };
  
  res.status(statusCode).json(clientResponse);
}

/**
 * Middleware to handle 404 for undefined routes
 */
function notFoundMiddleware(req, res, next) {
  next(notFound(`Route not found: ${req.method} ${req.path}`));
}

/**
 * Async handler to wrap async route handlers and catch errors
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  ApiError,
  errorMiddleware,
  notFoundMiddleware,
  asyncHandler,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  internalError
};

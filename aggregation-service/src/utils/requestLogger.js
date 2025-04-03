/**
 * Request Logger Middleware
 * 
 * Logs HTTP requests with timing information
 */

const logger = require('./logger');

/**
 * Middleware to log incoming requests and their response time
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requestLogger(req, res, next) {
  // Record start time
  const start = Date.now();
  
  // Log basic request info
  logger.debug(`Request started: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'] || 'Unknown'
  });
  
  // Store original end method to intercept it
  const originalEnd = res.end;
  
  // Override end method to capture response info
  res.end = function(chunk, encoding) {
    // Calculate request duration
    const duration = Date.now() - start;
    
    // Restore original end method and call it
    res.end = originalEnd;
    res.end(chunk, encoding);
    
    // Log the completed request
    logger.logAccess(req, res, duration);
  };
  
  next();
}

module.exports = requestLogger;

/**
 * Simple logger utility
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} - Formatted log message
 */
const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

/**
 * Log error message
 * @param {string} message - Error message
 * @param {Object} meta - Additional metadata
 */
export const error = (message, meta = {}) => {
  console.error(formatLog(LOG_LEVELS.ERROR, message, meta));
};

/**
 * Log warning message
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
export const warn = (message, meta = {}) => {
  console.warn(formatLog(LOG_LEVELS.WARN, message, meta));
};

/**
 * Log info message
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
export const info = (message, meta = {}) => {
  console.log(formatLog(LOG_LEVELS.INFO, message, meta));
};

/**
 * Log debug message (only in development)
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
export const debug = (message, meta = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(formatLog(LOG_LEVELS.DEBUG, message, meta));
  }
};

export default {
  error,
  warn,
  info,
  debug
};

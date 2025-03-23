/**
 * @fileoverview Error handling utilities for the application.
 * 
 * This module provides a centralized error handling mechanism including:
 * - Custom error classes for different types of errors
 * - Error logging functionality
 * - Error formatting for consistent error presentation
 * - Integration with error tracking services
 */

// Import any external error tracking service if needed
// import * as Sentry from '@sentry/browser';

/**
 * Application error types
 * @enum {string}
 */
export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  IMAGE_PROCESSING: 'IMAGE_PROCESSING_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Base application error class
 * @extends Error
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} type - Error type from ERROR_TYPES
   * @param {Object} [metadata] - Additional error metadata
   * @param {Error} [originalError] - Original error that was caught
   */
  constructor(message, type = ERROR_TYPES.UNKNOWN, metadata = {}, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.metadata = metadata;
    this.originalError = originalError;
    this.timestamp = new Date();
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation error class
 * @extends AppError
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Object} [validationErrors] - Validation errors by field
   * @param {Error} [originalError] - Original error that was caught
   */
  constructor(message, validationErrors = {}, originalError = null) {
    super(message, ERROR_TYPES.VALIDATION, { validationErrors }, originalError);
    this.name = 'ValidationError';
  }
}

/**
 * Network error class
 * @extends AppError
 */
export class NetworkError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {number} [status] - HTTP status code
   * @param {Object} [responseData] - Response data from API
   * @param {Error} [originalError] - Original error that was caught
   */
  constructor(message, status = null, responseData = null, originalError = null) {
    super(message, ERROR_TYPES.NETWORK, { status, responseData }, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Authentication error class
 * @extends AppError
 */
export class AuthenticationError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Error} [originalError] - Original error that was caught
   */
  constructor(message, originalError = null) {
    super(message, ERROR_TYPES.AUTHENTICATION, {}, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error class
 * @extends AppError
 */
export class AuthorizationError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {string} [resource] - Resource that was attempted to be accessed
   * @param {Error} [originalError] - Original error that was caught
   */
  constructor(message, resource = null, originalError = null) {
    super(message, ERROR_TYPES.AUTHORIZATION, { resource }, originalError);
    this.name = 'AuthorizationError';
  }
}

/**
 * Image Processing error class
 * @extends AppError
 */
export class ImageProcessingError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Object} [imageDetails] - Details about the image being processed
   * @param {Error} [originalError] - Original error that was caught
   */
  constructor(message, imageDetails = {}, originalError = null) {
    super(message, ERROR_TYPES.IMAGE_PROCESSING, { imageDetails }, originalError);
    this.name = 'ImageProcessingError';
  }
}

/**
 * Format error into a consistent structure for UI display
 * @param {Error} error - Error to format
 * @returns {Object} Formatted error object
 */
export const formatError = (error) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      type: error.type,
      timestamp: error.timestamp,
      details: error.metadata,
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    type: ERROR_TYPES.UNKNOWN,
    timestamp: new Date(),
    details: { stack: error.stack },
  };
};

/**
 * Log error to console and optionally to error tracking service
 * @param {Error} error - Error to log
 * @param {Object} [context] - Additional context information
 */
export const logError = (error, context = {}) => {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', error);
    if (Object.keys(context).length > 0) {
      console.error('Context:', context);
    }
  }

  // Log to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // Uncomment and configure when you add an error tracking service
    // Sentry.captureException(error, { extra: context });
  }
};

/**
 * Handle API errors by converting them to appropriate AppError types
 * @param {Error} error - Error from API call
 * @returns {AppError} Typed application error
 */
export const handleApiError = (error) => {
  // If it's already an AppError, return it directly
  if (error instanceof AppError) {
    return error;
  }

  // Handle axios errors
  if (error.response) {
    const { status, data } = error.response;
    
    // Authentication error
    if (status === 401) {
      return new AuthenticationError('Your session has expired or you are not authenticated', error);
    }
    
    // Authorization error
    if (status === 403) {
      return new AuthorizationError('You do not have permission to perform this action', null, error);
    }
    
    // Not found
    if (status === 404) {
      return new AppError('The requested resource was not found', ERROR_TYPES.NOT_FOUND, { url: error.config?.url }, error);
    }
    
    // Validation error
    if (status === 400 || status === 422) {
      return new ValidationError('Invalid data submitted', data?.errors || {}, error);
    }
    
    // Server error
    if (status >= 500) {
      return new AppError('A server error occurred. Please try again later', ERROR_TYPES.SERVER, { status }, error);
    }
    
    // Other HTTP errors
    return new NetworkError(`Request failed with status ${status}`, status, data, error);
  }
  
  // Network errors without response (e.g., connection issues)
  if (error.request) {
    return new NetworkError('Unable to connect to the server. Please check your internet connection', null, null, error);
  }
  
  // Default case for unknown errors
  return new AppError(error.message || 'An unexpected error occurred', ERROR_TYPES.UNKNOWN, {}, error);
};

/**
 * Safely execute a function and handle any errors
 * @param {Function} fn - Function to execute 
 * @param {Function} [errorHandler] - Custom error handler
 * @returns {Promise<*>} Result of the function or error
 */
export const tryCatch = async (fn, errorHandler) => {
  try {
    return await fn();
  } catch (error) {
    const appError = handleApiError(error);
    
    if (errorHandler) {
      return errorHandler(appError);
    }
    
    logError(appError);
    throw appError;
  }
};

/**
 * Initialize error tracking services
 * @param {Object} config - Configuration for error tracking
 */
export const initErrorTracking = (config = {}) => {
  if (process.env.NODE_ENV === 'production') {
    // Uncomment and configure when you add an error tracking service
    // Sentry.init({
    //   dsn: process.env.REACT_APP_SENTRY_DSN,
    //   environment: process.env.REACT_APP_ENVIRONMENT || 'development',
    //   ...config
    // });
  }
};

export default {
  ERROR_TYPES,
  AppError,
  ValidationError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ImageProcessingError,
  formatError,
  logError,
  handleApiError,
  tryCatch,
  initErrorTracking,
};


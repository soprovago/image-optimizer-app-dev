/**
 * Application Constants
 * 
 * This file contains all the constants used throughout the application,
 * organized by category for better maintenance and scalability.
 */

/**
 * API Endpoints
 * Constants related to API endpoints and service URLs
 */
export const API = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.imageoptimizer.com',
  ENDPOINTS: {
    IMAGES: '/api/images',
    UPLOAD: '/api/upload',
    OPTIMIZE: '/api/optimize',
    USERS: '/api/users',
    AUTH: '/api/auth',
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

/**
 * Image Processing Configurations
 * Constants related to image optimization and processing
 */
export const IMAGE_PROCESSING = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
  QUALITY_LEVELS: {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 80,
    BEST: 95,
  },
  MAX_DIMENSIONS: {
    WIDTH: 3840, // 4K
    HEIGHT: 2160, // 4K
  },
  THUMBNAIL_SIZE: {
    WIDTH: 200,
    HEIGHT: 200,
  },
  DEFAULT_COMPRESSION: 75,
  OPTIMIZATION_TYPES: {
    LOSSLESS: 'lossless',
    LOSSY: 'lossy',
    CUSTOM: 'custom',
  },
};

/**
 * Route Paths
 * Constants for application routes
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  IMAGES: '/images',
  IMAGE_DETAIL: '/images/:id',
  SETTINGS: '/settings',
  PASSWORD_RESET: '/password-reset',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  NOT_FOUND: '*',
};

/**
 * Error Messages
 * Standardized error messages used throughout the application
 */
export const ERROR_MESSAGES = {
  GENERAL: {
    DEFAULT: 'An unexpected error occurred. Please try again later.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EXPIRED_SESSION: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
    EMAIL_EXISTS: 'An account with this email already exists.',
    WEAK_PASSWORD: 'Password is too weak. It should be at least 8 characters with letters, numbers, and symbols.',
    SOCIAL_AUTH_FAILED: 'Social authentication failed. Please try again.',
  },
  IMAGE: {
    UPLOAD_FAILED: 'Failed to upload image. Please try again.',
    TOO_LARGE: 'Image file is too large. Maximum size is 10MB.',
    UNSUPPORTED_FORMAT: 'Unsupported image format. Please use JPG, PNG, WEBP, GIF, or SVG.',
    PROCESSING_FAILED: 'Image processing failed. Please try again.',
    DOWNLOAD_FAILED: 'Failed to download image. Please try again.',
    DELETE_FAILED: 'Failed to delete image. Please try again.',
  },
  FORM: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    PASSWORD_MISMATCH: 'Passwords do not match.',
    INVALID_INPUT: 'Invalid input. Please check and try again.',
  },
};

/**
 * UI Configurations
 * Constants related to user interface and theming
 */
export const UI = {
  THEME: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
  },
  DRAWER_WIDTH: 240,
  TOOLBAR_HEIGHT: 64,
  ANIMATION_DURATION: 300,
  SNACKBAR_DURATION: 4000,
  BREAKPOINTS: {
    XS: 0,
    SM: 600,
    MD: 960,
    LG: 1280,
    XL: 1920,
  },
  SPACING_UNIT: 8,
  DIALOG_SIZES: {
    SM: {
      maxWidth: 'sm',
      fullWidth: true,
    },
    MD: {
      maxWidth: 'md',
      fullWidth: true,
    },
    LG: {
      maxWidth: 'lg',
      fullWidth: true,
    },
  },
  BORDERS: {
    RADIUS: {
      SMALL: 4,
      MEDIUM: 8,
      LARGE: 16,
      CIRCULAR: '50%',
    },
  },
};

/**
 * Authentication Constants
 * Constants related to authentication and authorization
 */
export const AUTH = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  EXPIRY_KEY: 'token_expiry',
  SESSION_DURATION: 86400000, // 24 hours in milliseconds
  MIN_PASSWORD_LENGTH: 8,
  PROVIDERS: {
    EMAIL: 'email',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    TWITTER: 'twitter',
  },
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest',
  },
  PERMISSIONS: {
    READ: 'read',
    WRITE: 'write',
    DELETE: 'delete',
    MANAGE: 'manage',
  },
};

/**
 * Local Storage Keys
 * Constants for local storage key names
 */
export const STORAGE_KEYS = {
  THEME: 'theme_preference',
  USER_SETTINGS: 'user_settings',
  RECENT_UPLOADS: 'recent_uploads',
  IMAGE_HISTORY: 'image_history',
  RECENT_SEARCHES: 'recent_searches',
  OPTIMIZATION_PRESETS: 'optimization_presets',
};

/**
 * Time Constants
 * Time-related constants in milliseconds
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
};


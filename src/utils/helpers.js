/**
 * @file helpers.js
 * @description Collection of utility functions for common operations
 */

/**
 * ==========================================
 * DATE FORMATTING UTILITIES
 * ==========================================
 */

/**
 * Formats a date to a string using the specified format
 * @param {Date} date - The date to format
 * @param {string} format - Format string (e.g., 'YYYY-MM-DD')
 * @returns {string} Formatted date string
 * @example
 * // Returns "2023-05-15"
 * formatDate(new Date(2023, 4, 15), 'YYYY-MM-DD');
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Returns a relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - The date to convert
 * @returns {string} Relative time string
 * @example
 * // Returns something like "5 minutes ago"
 * getRelativeTime(new Date(Date.now() - 5 * 60 * 1000));
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now - inputDate;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);
  
  if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
};

/**
 * ==========================================
 * FILE HANDLING UTILITIES
 * ==========================================
 */

/**
 * Converts a file size in bytes to a human-readable string
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Human readable file size
 * @example
 * // Returns "1.5 MB"
 * formatFileSize(1500000);
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Gets a file extension from a filename
 * @param {string} filename - The filename
 * @returns {string} File extension
 * @example
 * // Returns "jpg"
 * getFileExtension('image.jpg');
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Checks if file type is an image
 * @param {string} filename - The filename or MIME type
 * @returns {boolean} True if the file is an image
 * @example
 * // Returns true
 * isImageFile('photo.jpg');
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
  const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'image/bmp'];
  
  // Check if input is a MIME type
  if (filename.includes('/')) {
    return imageMimeTypes.includes(filename.toLowerCase());
  }
  
  // Otherwise, treat as filename
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

/**
 * ==========================================
 * STRING MANIPULATION UTILITIES
 * ==========================================
 */

/**
 * Truncates a string to a maximum length and adds ellipsis
 * @param {string} str - The input string
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 * @example
 * // Returns "This is a long..."
 * truncateString("This is a long text that needs truncation", 14);
 */
export const truncateString = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

/**
 * Converts a string to title case
 * @param {string} str - The input string
 * @returns {string} Title cased string
 * @example
 * // Returns "Hello World"
 * toTitleCase("hello world");
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Slugifies a string (converts to lowercase, replaces spaces with hyphens)
 * @param {string} str - The input string
 * @returns {string} Slugified string
 * @example
 * // Returns "hello-world"
 * slugify("Hello World");
 */
export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * ==========================================
 * ARRAY MANIPULATION UTILITIES
 * ==========================================
 */

/**
 * Groups an array of objects by a specified key
 * @param {Array} array - The array to group
 * @param {string} key - The key to group by
 * @returns {Object} Grouped object
 * @example
 * // Returns { apple: [{id: 1, type: 'apple'}], orange: [{id: 2, type: 'orange'}] }
 * groupBy([{id: 1, type: 'apple'}, {id: 2, type: 'orange'}], 'type');
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Removes duplicate values from an array
 * @param {Array} array - The input array
 * @returns {Array} Array with unique values
 * @example
 * // Returns [1, 2, 3]
 * uniqueArray([1, 2, 2, 3, 1]);
 */
export const uniqueArray = (array) => {
  return [...new Set(array)];
};

/**
 * Sorts an array of objects by a specified key
 * @param {Array} array - The array to sort
 * @param {string} key - The key to sort by
 * @param {boolean} ascending - Sort in ascending order
 * @returns {Array} Sorted array
 * @example
 * // Returns [{name: 'Adam', age: 20}, {name: 'Bob', age: 30}]
 * sortByKey([{name: 'Bob', age: 30}, {name: 'Adam', age: 20}], 'name');
 */
export const sortByKey = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1;
    if (a[key] > b[key]) return ascending ? 1 : -1;
    return 0;
  });
};

/**
 * ==========================================
 * OBJECT MANIPULATION UTILITIES
 * ==========================================
 */

/**
 * Creates a deep clone of an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 * @example
 * const obj = { a: 1, b: { c: 2 } };
 * const clone = deepClone(obj);
 * // clone.b.c = 3 won't affect original obj
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Picks selected properties from an object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {Object} New object with only the specified keys
 * @example
 * // Returns { name: 'John', age: 30 }
 * pick({ name: 'John', age: 30, job: 'Developer' }, ['name', 'age']);
 */
export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omits specified properties from an object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {Object} New object without the specified keys
 * @example
 * // Returns { name: 'John' }
 * omit({ name: 'John', age: 30, job: 'Developer' }, ['age', 'job']);
 */
export const omit = (obj, keys) => {
  return Object.keys(obj)
    .filter(key => !keys.includes(key))
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

/**
 * ==========================================
 * DATA VALIDATION UTILITIES
 * ==========================================
 */

/**
 * Validates an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 * @example
 * // Returns true
 * isValidEmail('user@example.com');
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validates a URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 * @example
 * // Returns true
 * isValidUrl('https://example.com');
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} True if value is empty
 * @example
 * // Returns true
 * isEmpty('');
 * isEmpty([]);
 * isEmpty({});
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * ==========================================
 * UNIT CONVERSION UTILITIES
 * ==========================================
 */

/**
 * Converts pixels to rem units
 * @param {number} px - Pixel value
 * @param {number} base - Base font size
 * @returns {string} Rem value
 * @example
 * // Returns "1rem"
 * pxToRem(16);
 */
export const pxToRem = (px, base = 16) => {
  return `${px / base}rem`;
};

/**
 * Converts celsius to fahrenheit
 * @param {number} celsius - Temperature in celsius
 * @returns {number} Temperature in fahrenheit
 * @example
 * // Returns 68
 * celsiusToFahrenheit(20);
 */
export const celsiusToFahrenheit = (celsius) => {
  return (celsius * 9/5) + 32;
};

/**
 * Converts fahrenheit to celsius
 * @param {number} fahrenheit - Temperature in fahrenheit
 * @returns {number} Temperature in celsius
 * @example
 * // Returns 20
 * fahrenheitToCelsius(68);
 */
export const fahrenheitToCelsius = (fahrenheit) => {
  return (fahrenheit - 32) * 5/9;
};

/**
 * Converts miles to kilometers
 * @param {number} miles - Distance in miles
 * @returns {number} Distance in kilometers
 * @example
 * // Returns 8.04672
 * milesToKm(5);
 */
export const milesToKm = (miles) => {
  return miles * 1.60934;
};

/**
 * Converts kilometers to miles
 * @param {number} km - Distance in kilometers
 * @returns {number} Distance in miles
 * @example
 * // Returns 3.10686
 * kmToMiles(5);
 */
export const kmToMiles = (km) => {
  return km * 0.621371;
};

/**
 * Test suite for helpers.js
 * Uncomment and use with a testing framework like Jest
 */
/*
test('formatDate', () => {
  expect(formatDate(new Date(2023, 4, 15), 'YYYY-MM-DD


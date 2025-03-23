import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * @typedef {Object} LoadingState
 * @property {boolean} isLoading - Whether the loading state is active
 * @property {string|null} message - Optional message to display during loading
 * @property {number|null} startTime - Timestamp when loading started
 * @property {number|null} timeoutId - ID of the timeout if one is set
 */

/**
 * @typedef {Object} UseLoadingOptions
 * @property {number} [defaultTimeout=30000] - Default timeout in milliseconds
 * @property {string} [defaultMessage='Loading...'] - Default loading message
 * @property {Function} [onTimeout] - Callback function when timeout occurs
 */

/**
 * @typedef {Object} UseLoadingReturn
 * @property {boolean} isLoading - Whether any loading state is active
 * @property {Object.<string, LoadingState>} loadingStates - Map of all loading states
 * @property {Function} startLoading - Function to start a loading state
 * @property {Function} stopLoading - Function to stop a loading state
 * @property {Function} setLoadingMessage - Function to update a loading message
 * @property {Function} resetAllLoading - Function to reset all loading states
 * @property {string|null} currentMessage - Current loading message to display
 * @property {boolean} hasTimedOut - Whether any loading state has timed out
 */

/**
 * Custom hook for managing loading states with support for timeouts and messages
 * 
 * @param {UseLoadingOptions} options - Configuration options
 * @returns {UseLoadingReturn} Loading state and control functions
 * 
 * @example
 * // Basic usage
 * const { isLoading, startLoading, stopLoading } = useLoading();
 * 
 * // Start loading
 * startLoading('fetchData');
 * 
 * // Stop loading
 * stopLoading('fetchData');
 * 
 * @example
 * // With timeout and message
 * const { isLoading, startLoading, stopLoading, currentMessage } = useLoading({
 *   defaultTimeout: 10000,
 *   onTimeout: () => console.error('Operation timed out'),
 * });
 * 
 * // Start loading with custom message and timeout
 * startLoading('savingData', 'Saving your changes...', 5000);
 */
const useLoading = (options = {}) => {
  const {
    defaultTimeout = 30000,
    defaultMessage = 'Loading...',
    onTimeout = () => {},
  } = options;

  // State to track all loading states
  const [loadingStates, setLoadingStates] = useState({});
  // Ref to prevent memory leaks with timeouts
  const timeoutRefs = useRef({});
  // State to track if any loading operation has timed out
  const [hasTimedOut, setHasTimedOut] = useState(false);

  /**
   * Start a loading operation with optional message and timeout
   * 
   * @param {string} key - Unique identifier for the loading operation
   * @param {string} [message=defaultMessage] - Message to display during loading
   * @param {number} [timeout=defaultTimeout] - Timeout in milliseconds
   */
  const startLoading = useCallback((key, message = defaultMessage, timeout = defaultTimeout) => {
    // Clear any existing timeout for this key
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
    }

    let timeoutId = null;
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        setHasTimedOut(true);
        onTimeout(key);
        
        // Update the loading state to include timedOut flag but keep it loading
        setLoadingStates(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            timedOut: true,
          }
        }));
      }, timeout);

      timeoutRefs.current[key] = timeoutId;
    }

    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        message,
        startTime: Date.now(),
        timeoutId,
        timedOut: false,
      }
    }));
  }, [defaultMessage, defaultTimeout, onTimeout]);

  /**
   * Stop a loading operation
   * 
   * @param {string} key - Unique identifier for the loading operation
   */
  const stopLoading = useCallback((key) => {
    // Clear any timeout
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }

    setLoadingStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });

    // Reset the timedOut state if no other loading operations are timed out
    setHasTimedOut(prev => {
      if (!prev) return false;
      // Check if any remaining loading states have timed out
      const anyTimedOut = Object.values(loadingStates).some(
        state => state.timedOut && state.key !== key
      );
      return anyTimedOut;
    });
  }, []);

  /**
   * Update the message for a loading operation
   * 
   * @param {string} key - Unique identifier for the loading operation
   * @param {string} message - New message to display
   */
  const setLoadingMessage = useCallback((key, message) => {
    setLoadingStates(prev => {
      if (!prev[key]) return prev;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          message,
        }
      };
    });
  }, []);

  /**
   * Reset all loading states
   */
  const resetAllLoading = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutRefs.current).forEach(id => {
      clearTimeout(id);
    });
    timeoutRefs.current = {};
    
    setLoadingStates({});
    setHasTimedOut(false);
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(id => {
        clearTimeout(id);
      });
    };
  }, []);

  // Compute the current message to display (prioritizing the most recent loading state)
  const currentMessage = Object.values(loadingStates).length > 0
    ? Object.values(loadingStates)
        .sort((a, b) => b.startTime - a.startTime)[0].message
    : null;

  // Determine if any loading state is active
  const isLoading = Object.values(loadingStates).length > 0;

  return {
    isLoading,
    loadingStates,
    startLoading,
    stopLoading,
    setLoadingMessage,
    resetAllLoading,
    currentMessage,
    hasTimedOut,
  };
};

export default useLoading;


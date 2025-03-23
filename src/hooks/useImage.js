import { useState, useCallback, useEffect } from 'react';

/**
 * @typedef {Object} ImageState
 * @property {string|null} originalSrc - Original source URL of the image
 * @property {string|null} previewSrc - Preview source URL of the image (smaller size)
 * @property {File|null} file - Original image file
 * @property {number|null} size - Size of the original image in bytes
 * @property {number|null} optimizedSize - Size of the optimized image in bytes
 * @property {number} width - Width of the image
 * @property {number} height - Height of the image
 * @property {string} format - Format of the image (e.g., 'jpeg', 'png')
 * @property {number} quality - Quality level of the image (0-100)
 */

/**
 * @typedef {Object} UseImageReturn
 * @property {ImageState} image - Current image state
 * @property {boolean} loading - Loading status
 * @property {string|null} error - Error message if any
 * @property {Function} loadImage - Function to load an image from a file
 * @property {Function} loadImageFromUrl - Function to load an image from a URL
 * @property {Function} generatePreview - Function to generate a preview
 * @property {Function} optimizeImage - Function to optimize the image
 * @property {Function} resizeImage - Function to resize the image
 * @property {Function} convertFormat - Function to convert image format
 * @property {Function} resetImage - Function to reset image state
 * @property {Function} getOptimizationStats - Get statistics about optimization
 */

/**
 * Custom hook for image loading, processing and optimization
 * @param {Object} options - Configuration options
 * @param {number} [options.previewMaxWidth=200] - Maximum width for preview images
 * @param {number} [options.previewMaxHeight=200] - Maximum height for preview images
 * @param {number} [options.defaultQuality=80] - Default quality for image optimization
 * @param {string[]} [options.acceptedFormats=['image/jpeg', 'image/png', 'image/gif', 'image/webp']] - Accepted image formats
 * @param {number} [options.maxFileSizeMB=10] - Maximum file size in MB
 * @returns {UseImageReturn} Image handling methods and state
 */
const useImage = ({
  previewMaxWidth = 200,
  previewMaxHeight = 200,
  defaultQuality = 80,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFileSizeMB = 10,
} = {}) => {
  // Initialize state
  const [image, setImage] = useState({
    originalSrc: null,
    previewSrc: null,
    file: null,
    size: null,
    optimizedSize: null,
    width: 0,
    height: 0,
    format: '',
    quality: defaultQuality,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Utility function to validate an image file
   * @param {File} file - Image file to validate
   * @returns {boolean} Is the file valid
   */
  const validateImageFile = useCallback((file) => {
    setError(null);

    // Check if file exists
    if (!file) {
      setError('No file selected');
      return false;
    }

    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      setError(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      return false;
    }

    // Check file size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File too large. Maximum size: ${maxFileSizeMB}MB`);
      return false;
    }

    return true;
  }, [acceptedFormats, maxFileSizeMB]);

  /**
   * Load an image from a file
   * @param {File} file - Image file to load
   * @returns {Promise<void>}
   */
  const loadImage = useCallback(async (file) => {
    if (!validateImageFile(file)) {
      return;
    }

    setLoading(true);
    try {
      // Create a URL for the file
      const src = URL.createObjectURL(file);
      
      // Create an image element to get dimensions
      const img = new Image();
      const imgPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      img.src = src;
      await imgPromise;
      
      // Extract format from file type
      const format = file.type.split('/')[1];
      
      setImage({
        originalSrc: src,
        previewSrc: null, // Preview will be generated separately
        file,
        size: file.size,
        optimizedSize: null,
        width: img.width,
        height: img.height,
        format,
        quality: defaultQuality,
      });
      
      // Generate preview automatically
      generatePreview(src, img.width, img.height);
    } catch (err) {
      setError(`Failed to load image: ${err.message}`);
      console.error('Error loading image:', err);
    } finally {
      setLoading(false);
    }
  }, [validateImageFile, defaultQuality]);

  /**
   * Load an image from a URL
   * @param {string} url - URL of the image to load
   * @returns {Promise<void>}
   */
  const loadImageFromUrl = useCallback(async (url) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the image as a blob
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Check content type
      if (!acceptedFormats.includes(blob.type)) {
        throw new Error(`Invalid image format: ${blob.type}`);
      }
      
      // Create a file from the blob
      const fileName = url.split('/').pop() || 'image.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      
      // Use loadImage to process the file
      await loadImage(file);
    } catch (err) {
      setError(`Failed to load image from URL: ${err.message}`);
      console.error('Error loading image from URL:', err);
    } finally {
      setLoading(false);
    }
  }, [loadImage, acceptedFormats]);

  /**
   * Generate a preview of the image
   * @param {string} src - Source URL of the image
   * @param {number} width - Original width of the image
   * @param {number} height - Original height of the image
   * @returns {Promise<string|null>} Preview URL or null if failed
   */
  const generatePreview = useCallback(async (src, width, height) => {
    if (!src) {
      return null;
    }

    try {
      // Calculate aspect ratio
      const aspectRatio = width / height;
      
      // Determine preview dimensions maintaining aspect ratio
      let previewWidth, previewHeight;
      
      if (width > height) {
        previewWidth = Math.min(previewMaxWidth, width);
        previewHeight = previewWidth / aspectRatio;
      } else {
        previewHeight = Math.min(previewMaxHeight, height);
        previewWidth = previewHeight * aspectRatio;
      }
      
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      canvas.width = previewWidth;
      canvas.height = previewHeight;
      
      const ctx = canvas.getContext('2d');
      
      // Load the image
      const img = new Image();
      const imgPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      img.src = src;
      await imgPromise;
      
      // Draw the image on canvas with resizing
      ctx.drawImage(img, 0, 0, previewWidth, previewHeight);
      
      // Convert to DataURL with reduced quality
      const previewQuality = 0.6; // Lower quality for preview
      const previewSrc = canvas.toDataURL(`image/${image.format || 'jpeg'}`, previewQuality);
      
      // Update the image state with the preview
      setImage(prevImage => ({
        ...prevImage,
        previewSrc,
      }));
      
      return previewSrc;
    } catch (err) {
      console.error('Error generating preview:', err);
      return null;
    }
  }, [previewMaxWidth, previewMaxHeight, image.format]);

  /**
   * Optimize the image by adjusting quality and dimensions
   * @param {Object} options - Optimization options
   * @param {number} [options.quality] - Quality level (1-100)
   * @param {number} [options.maxWidth] - Maximum width
   * @param {number} [options.maxHeight] - Maximum height
   * @returns {Promise<Blob|null>} Optimized image as Blob or null if failed
   */
  const optimizeImage = useCallback(async ({ 
    quality = image.quality, 
    maxWidth = null, 
    maxHeight = null,
  } = {}) => {
    if (!image.originalSrc) {
      setError('No image to optimize');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Load the original image
      const img = new Image();
      const imgPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      img.src = image.originalSrc;
      await imgPromise;
      
      // Determine output dimensions
      let outputWidth = img.width;
      let outputHeight = img.height;
      
      // Resize if maxWidth or maxHeight is specified
      if (maxWidth && outputWidth > maxWidth) {
        const ratio = maxWidth / outputWidth;
        outputWidth = maxWidth;
        outputHeight = Math.round(outputHeight * ratio);
      }
      
      if (maxHeight && outputHeight > maxHeight) {
        const ratio = maxHeight / outputHeight;
        outputHeight = maxHeight;
        outputWidth = Math.round(outputWidth * ratio);
      }
      
      // Create a canvas for the output image
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      
      const ctx = canvas.getContext('2d');
      
      // Draw the image on the canvas with the new dimensions
      ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
      
      // Convert to Blob with specified quality
      const qualityFactor = quality / 100;
      
      // Create a promise to handle the asynchronous toBlob method
      const blobPromise = new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, `image/${image.format || 'jpeg'}`, qualityFactor);
      });
      
      const optimizedBlob = await blobPromise;
      
      // Update image state with optimization results
      setImage(prevImage => ({
        ...prevImage,
        optimizedSize: optimizedBlob.size,
        quality,
        width: outputWidth,
        height: outputHeight,
      }));
      
      return optimizedBlob;
    } catch (err) {
      setError(`Failed to optimize image: ${err.message}`);
      console.error('Error optimizing image:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [image.originalSrc, image.quality, image.format]);

  /**
   * Resize the image to specific dimensions
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @param {boolean} [maintainAspectRatio=true] - Whether to maintain aspect ratio
   * @returns {Promise<Blob|null>} Resized image as Blob or null if failed
   */
  const resizeImage = useCallback(async (width, height, maintainAspectRatio = true) => {
    if (!image.originalSrc) {
      setError('No image to resize');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Load the original image
      const img = new Image();
      const imgPromise = new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      img.src = image.originalSrc;
      await imgPromise;
      
      // Determine output dimensions
      let outputWidth = width;
      let outputHeight = height;
      
      // Adjust dimensions to maintain aspect ratio if needed
      if (maintainAspectRatio) {
        const aspectRatio = img.width / img.height;
        
        if (width / height > aspectRatio) {
          // Height is the limiting factor
          outputWidth = Math.round(height * aspectRatio);
          outputHeight = height;
        } else {
          // Width is the limiting factor
          outputWidth = width;
          outputHeight = Math.round(width / aspectRatio);
        }
      }
      
      // Create a canvas for the output image
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      
      const ctx = canvas.getContext('2d');
      
      // Draw the image on the canvas with the new dimensions
      ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
      
      // Convert to Blob with current quality
      const qualityFactor = image.quality / 100;
      
      // Create a promise to handle the asynchronous toBlob method
      const blobPromise = new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, `image/${image.format || 'jpeg'}`, qualityFactor);
      });
      
      const resizedBlob = await blobPromise;
      
      // Update image state with new dimensions
      setImage(prevImage => ({
        ...prevImage,
        width: outputWidth,
        height: outputHeight,
        size: resizedBlob.size,
      }));
      
      return resizedBlob;
    } catch (err) {
      setError(`Failed to resize image: ${err.message}`);
      console.error('Error resizing image:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [image.originalSrc, image.quality, image.format]);

  /**
   * Convert the image to a different format
   * @param {string} newFormat - Target format (e.g., 'jpeg', 'png', 'webp')
   * @returns {Promise<Blob|null>} Converted image as Blob or null if failed
   */
  const convertFormat = useCallback(async (newFormat) => {
    if (!image.originalSrc) {
      setError('No image to convert');
      return null;
    }

    // Validate format
    const validFormats = ['jpeg', 'png', '


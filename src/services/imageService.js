const MAX_WIDTH = 1920; // Maximum width for optimized images
const MAX_HEIGHT = 1080; // Maximum height for optimized images

export const optimizeImage = async (file, quality, format) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const optimizedBlob = processImage(img, quality, format);
          resolve({
            file: optimizedBlob,
            originalSize: file.size,
            newSize: optimizedBlob.size,
            name: file.name,
            preview: URL.createObjectURL(optimizedBlob)
          });
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

const processImage = (img, quality, format) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Calculate new dimensions while maintaining aspect ratio
  let { width, height } = calculateDimensions(img.width, img.height);
  
  canvas.width = width;
  canvas.height = height;

  // Draw image with white background (for transparent PNGs)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Convert to the desired format
  const mimeType = `image/${format === 'jpeg' ? 'jpeg' : format}`;
  const dataUrl = canvas.toDataURL(mimeType, quality / 100);
  
  // Convert base64 to Blob
  const byteString = atob(dataUrl.split(',')[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([arrayBuffer], { type: mimeType });
};

const calculateDimensions = (width, height) => {
  if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
    return { width, height };
  }

  const aspectRatio = width / height;

  if (width > MAX_WIDTH) {
    width = MAX_WIDTH;
    height = Math.round(width / aspectRatio);
  }

  if (height > MAX_HEIGHT) {
    height = MAX_HEIGHT;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
};

export const downloadImage = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


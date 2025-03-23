import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure security headers for SharedArrayBuffer and cross-origin isolation
app.use((req, res, next) => {
  // Required for SharedArrayBuffer
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  
  // Additional security headers
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  next();
});

// Set correct MIME types for various file types
const mimeTypes = {
  '.wasm': 'application/wasm',
  '.worker.js': 'application/javascript',
  '.data': 'application/octet-stream',
  '.mem': 'application/octet-stream',
  '.js.mem': 'application/octet-stream'
};

// Specific FFmpeg file routes with proper MIME types
app.get('/ffmpeg/*', (req, res, next) => {
  const filePath = join(__dirname, req.path);
  
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).send('File not found');
    }
    
    // Set the appropriate content type based on file extension
    const ext = Object.keys(mimeTypes).find(ext => filePath.endsWith(ext));
    if (ext) {
      res.set('Content-Type', mimeTypes[ext]);
    }
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error(`Error serving FFmpeg file: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

// Set correct MIME type for WebAssembly files
app.get('*.wasm', (req, res, next) => {
  res.set('Content-Type', 'application/wasm');
  next();
});

// Serve static files from the 'build' directory in production or 'public' in development
const staticDir = process.env.NODE_ENV === 'production' ? 'build' : 'public';
app.use(express.static(join(__dirname, staticDir)));

// Send all requests to index.html so client-side routing works
app.get('*', (req, res) => {
  try {
    res.sendFile(join(__dirname, staticDir, 'index.html'));
  } catch (error) {
    console.error(`Error serving index.html: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Unhandled error: ${err.stack}`);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS headers configured for SharedArrayBuffer support`);
  console.log(`Serving static files from ${staticDir} directory`);
  console.log(`FFmpeg files route configured with proper MIME types`);
}).on('error', (error) => {
  console.error(`Failed to start server: ${error.message}`);
});


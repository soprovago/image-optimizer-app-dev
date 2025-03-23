// This is a web worker that helps with CORS and SharedArrayBuffer support for FFmpeg-wasm

self.importScripts('https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js');

self.onmessage = async (e) => {
  const { type, message, id } = e.data;

  if (type === 'init') {
    self.postMessage({ type: 'ready', id });
  }

  if (type === 'run') {
    try {
      const { args } = message;
      const result = await self.ffmpeg(...args);
      self.postMessage({ type: 'done', result, id });
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message, id });
    }
  }
};


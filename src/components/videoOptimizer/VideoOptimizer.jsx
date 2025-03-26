import React, { useState, useRef } from 'react';
import { 
  Button, 
  Slider, 
  Box, 
  Typography, 
  CircularProgress,
  LinearProgress 
} from '@mui/material';

const VideoOptimizer = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(75);
  const [scale, setScale] = useState(1);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    if (videoRef.current) {
      videoRef.current.src = url;
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      processFile(file);
    }
  };

  const compressVideo = async () => {
    if (!videoFile) return;
    
    try {
      setProcessingVideo(true);
      setStatus('Iniciando compresión...');
      setProgress(0);

      if (!('VideoEncoder' in window)) {
        throw new Error('WebCodecs API no está soportada en este navegador');
      }

      const sourceVideo = document.createElement('video');
      sourceVideo.src = URL.createObjectURL(videoFile);
      
      await new Promise((resolve) => {
        sourceVideo.onloadedmetadata = () => {
          sourceVideo.play();
          resolve();
        };
      });

      const targetWidth = Math.floor(sourceVideo.videoWidth * scale);
      const targetHeight = Math.floor(sourceVideo.videoHeight * scale);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const mediaRecorder = new MediaRecorder(canvas.captureStream(), {
        mimeType: 'video/mp4',
        videoBitsPerSecond: 1_000_000 * (quality / 100)
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-optimizado-${quality}calidad-${scale}x.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus('¡Video optimizado con éxito!');
      };

      const totalFrames = Math.ceil(sourceVideo.duration * 30);
      let processedFrames = 0;

      const processFrame = () => {
        if (sourceVideo.ended || processedFrames >= totalFrames) {
          mediaRecorder.stop();
          return;
        }

        ctx.drawImage(sourceVideo, 0, 0, targetWidth, targetHeight);
        processedFrames++;
        
        const currentProgress = (processedFrames / totalFrames) * 100;
        setProgress(Math.min(Math.floor(currentProgress), 100));

        requestAnimationFrame(processFrame);
      };

      mediaRecorder.start();
      processFrame();

    } catch (error) {
      console.error('Error:', error);
      setStatus('Error: ' + error.message);
    } finally {
      setProcessingVideo(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Optimizador de Video
      </Typography>
      
      <Box
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: isDragging ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
          transition: 'all 0.3s ease'
        }}
      >
        <input
          accept="video/*"
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="video-input"
        />
        
        <label htmlFor="video-input">
          <Button variant="contained" component="span" sx={{ mb: 2 }}>
            Seleccionar Video
          </Button>
        </label>
        
        <Typography>
          o arrastra y suelta tu video aquí
        </Typography>
      </Box>

      {videoFile && (
        <Box sx={{ mt: 3 }}>
          <video
            ref={videoRef}
            controls
            style={{ maxWidth: '100%', marginBottom: '1rem' }}
          />

          <Typography gutterBottom>
            Calidad de Compresión: {quality}%
          </Typography>
          <Slider
            value={quality}
            onChange={(e, newValue) => setQuality(newValue)}
            min={1}
            max={100}
            valueLabelDisplay="auto"
            sx={{ mb: 2 }}
          />

          <Typography gutterBottom>
            Escala: {scale.toFixed(2)}x
          </Typography>
          <Slider
            value={scale}
            onChange={(e, newValue) => setScale(newValue)}
            min={0.1}
            max={1}
            step={0.1}
            valueLabelDisplay="auto"
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={compressVideo}
            disabled={processingVideo}
            sx={{ mb: 2 }}
          >
            {processingVideo ? (
              <CircularProgress size={24} />
            ) : (
              'Comprimir Video'
            )}
          </Button>

          {status && (
            <Typography 
              color={status.includes('Error') ? 'error' : 'primary'}
              sx={{ mb: 1 }}
            >
              {status}
            </Typography>
          )}

          {processingVideo && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" color="text.secondary">
                {Math.round(progress)}%
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default VideoOptimizer;


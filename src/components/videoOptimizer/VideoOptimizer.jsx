import React, { useState } from 'react';
import { 
  Button, 
  Slider, 
  Box, 
  Typography, 
  CircularProgress,
  Alert
} from '@mui/material';

const VideoOptimizer = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(75);
  const [scale, setScale] = useState(1);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    } else {
      setStatus({
        type: 'error',
        message: 'Por favor, selecciona un archivo de video válido.'
      });
    }
  };

  const processFile = (file) => {
    setVideoFile(file);
    setStatus({ type: '', message: '' });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      processFile(file);
    } else {
      setStatus({
        type: 'error',
        message: 'Por favor, selecciona un archivo de video válido.'
      });
    }
  };

  const compressVideo = async () => {
    if (!videoFile) return;
    
    try {
      setProcessingVideo(true);
      setStatus({
        type: 'info',
        message: 'Iniciando compresión...'
      });
      setProgress(0);

      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(videoFile);
      
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play();
          resolve();
        };
      });

      const stream = videoElement.captureStream();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=h264,opus'
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      const totalDuration = videoElement.duration;
      let startTime = Date.now();

      mediaRecorder.onstop = async () => {
        const webmBlob = new Blob(chunks, { type: 'video/webm' });
        
        // Convertir WebM a MP4 manteniendo el audio
        const response = await fetch(URL.createObjectURL(webmBlob));
        const arrayBuffer = await response.arrayBuffer();
        
        const mp4Blob = new Blob([arrayBuffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(mp4Blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-optimizado-${quality}calidad-${scale}x.mp4`;
        a.click();
        
        URL.revokeObjectURL(url);
        setStatus({
          type: 'success',
          message: '¡Video optimizado exitosamente!'
        });
      };

      videoElement.ontimeupdate = () => {
        const currentTime = videoElement.currentTime;
        const progressPercent = (currentTime / totalDuration) * 100;
        setProgress(Math.min(Math.round(progressPercent), 100));
      };

      mediaRecorder.start();
      
      videoElement.onended = () => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };

    } catch (error) {
      console.error('Error:', error);
      setStatus({
        type: 'error',
        message: `Error al procesar el video: ${error.message}`
      });
    } finally {
      setProcessingVideo(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Optimizador de Video
      </Typography>
      
      {status.message && (
        <Alert 
          severity={status.type || 'info'} 
          sx={{ mb: 2 }}
          onClose={() => setStatus({ type: '', message: '' })}
        >
          {status.message}
        </Alert>
      )}

      <Box
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

        {videoFile && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Archivo seleccionado: {videoFile.name}
          </Typography>
        )}
      </Box>

      {videoFile && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
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

          <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
            {processingVideo && (
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={progress}
                  size={60}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" component="div" color="text.secondary">
                    {`${Math.round(progress)}%`}
                  </Typography>
                </Box>
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={compressVideo}
              disabled={processingVideo}
            >
              {processingVideo ? 'Procesando...' : 'Comprimir Video'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VideoOptimizer;


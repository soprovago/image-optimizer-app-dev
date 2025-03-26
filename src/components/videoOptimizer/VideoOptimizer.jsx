import React, { useState } from 'react';
import { 
  Button, 
  Box, 
  Typography,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const VideoOptimizer = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [progress, setProgress] = useState(0);
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
    setProgress(0);

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
    setProgress(0);
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

  const handleRemoveFile = () => {
    setVideoFile(null);
    setStatus({ type: '', message: '' });
    setProgress(0);
  };

  const compressVideo = async () => {
    if (!videoFile) return;
    
    try {
      setProcessingVideo(true);
      setProgress(0);
      setStatus({
        type: 'info',
        message: 'Procesando video...'
      });

      // Simular progreso para mejor experiencia de usuario
      const simulateProgress = () => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + 1;
          }
          return prev;
        });
      };

      const progressInterval = setInterval(simulateProgress, 100);

      // Create hidden video element
      const videoElement = document.createElement('video');
      videoElement.style.display = 'none';
      document.body.appendChild(videoElement);
      
      // Set up video element
      videoElement.muted = true;
      videoElement.src = URL.createObjectURL(videoFile);
      
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          resolve();
        };
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Get stream from canvas
      const stream = canvas.captureStream();
      
      // Add audio track from original video if available
      const audioTracks = videoElement.captureStream().getAudioTracks();
      if (audioTracks.length > 0) {
        stream.addTrack(audioTracks[0]);
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=h264,opus',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = async () => {
        clearInterval(progressInterval);
        const webmBlob = new Blob(chunks, { type: 'video/webm' });
        const mp4Blob = new Blob([webmBlob], { type: 'video/mp4' });
        const url = URL.createObjectURL(mp4Blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_optimizado.mp4`;
        a.click();
        
        URL.revokeObjectURL(url);
        videoElement.remove();
        
        setProgress(100);
        setStatus({
          type: 'success',
          message: '¡Video optimizado exitosamente!'
        });
        setProcessingVideo(false);
      };

      // Start recording
      videoElement.play();
      mediaRecorder.start();

      videoElement.onended = () => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };

    } catch (error) {
      console.error('Error:', error);
      setStatus({
        type: 'error',
        message: 'Error al procesar el video. Por favor, intenta nuevamente.'
      });
      setProgress(0);
      setProcessingVideo(false);
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2 
      }}
    >
      <Typography variant="h5" component="h1" align="center" gutterBottom>
        Optimizador de Video
      </Typography>

      {status.message && (
        <Alert 
          severity={status.type} 
          onClose={() => setStatus({ type: '', message: '' })}
        >
          {status.message}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          backgroundColor: isDragging ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.300',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <input
            accept="video/*"
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="video-input"
          />

          {!videoFile ? (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h6" align="center">
                Arrastra y suelta tu video aquí
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                o
              </Typography>
              <label htmlFor="video-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<VideoFileIcon />}
                >
                  Seleccionar Video
                </Button>
              </label>
            </>
          ) : (
            <List sx={{ width: '100%' }}>
              <ListItem
                secondaryAction={
                  <Button
                    edge="end"
                    aria-label="delete"
                    onClick={handleRemoveFile}
                    startIcon={<DeleteIcon />}
                    color="error"
                  >
                    Eliminar
                  </Button>
                }
              >
                <ListItemIcon>
                  <VideoFileIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={videoFile.name}
                  secondary={`${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`}
                />
              </ListItem>
            </List>
          )}
        </Box>
      </Paper>

      {videoFile && !processingVideo && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={compressVideo}
            startIcon={<CheckCircleIcon />}
          >
            Optimizar Video
          </Button>
        </Box>
      )}

      {processingVideo && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={progress}
              size={60}
              thickness={4}
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
              <Typography variant="caption" color="text.secondary">
                {`${Math.round(progress)}%`}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Procesando video...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoOptimizer;


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
  
  const handleRemoveFile = () => {
    setVideoFile(null);
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
      videoElement.muted = true;
      
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
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
        a.download = `video-optimizado.mp4`;
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
      <Typography variant="h5" gutterBottom align="center">
        Optimizador de Video
      </Typography>

      {status.message && (
        <Alert 
          severity={status.type} 
          sx={{ mb: 2 }}
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
          cursor: 'pointer'
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
                  >
                    Eliminar
                  </Button>
                }
              >
                <ListItemIcon>
                  <VideoFileIcon />
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
            mt: 2,
            gap: 1
          }}
        >
          <CircularProgress
            variant="determinate"
            value={progress}
            size={60}
            thickness={4}
          />
          <Typography variant="body2" color="textSecondary">
            {progress}% Completado
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoOptimizer;


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
  CircularProgress,
  Divider
} from '@mui/material';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';

const VideoOptimizer = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [optimizedVideo, setOptimizedVideo] = useState(null);
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
    setOptimizedVideo(null);

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
    setOptimizedVideo(null);
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
    setOptimizedVideo(null);
    setStatus({ type: '', message: '' });
    setProgress(0);
  };

  const handleDownload = () => {
    if (!optimizedVideo) return;
    
    const url = URL.createObjectURL(optimizedVideo);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video_optimizado.mp4`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const compressVideo = async () => {
    if (!videoFile) return;
    
    try {
      setProcessingVideo(true);
      setProgress(0);
      setOptimizedVideo(null);
      setStatus({
        type: 'info',
        message: 'Procesando video...'
      });

      const videoElement = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      videoElement.muted = true;
      
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = () => resolve();
        videoElement.onerror = () => reject(new Error("Error loading video"));
        videoElement.src = URL.createObjectURL(videoFile);
      });

      // Calcular dimensiones optimizadas
      let targetWidth = videoElement.videoWidth;
      let targetHeight = videoElement.videoHeight;
      const aspectRatio = targetWidth / targetHeight;
      
      // Reducir resolución si es necesario
      if (targetWidth > 854) { // máximo 480p
        targetWidth = 854;
        targetHeight = Math.round(targetWidth / aspectRatio);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Configurar calidad de dibujo
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const stream = canvas.captureStream(24); // 24fps para mejor compresión
      
      // Agregar audio si existe
      const audioTracks = videoElement.captureStream().getAudioTracks();
      if (audioTracks.length > 0) {
        stream.addTrack(audioTracks[0]);
      }

      const chunks = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 800000 // 800kbps
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const duration = videoElement.duration;
      let lastTime = 0;

      const processFrame = () => {
        if (!videoElement.paused && !videoElement.ended) {
          const currentTime = videoElement.currentTime;
          
          if (currentTime > lastTime) {
            const progress = (currentTime / duration) * 100;
            setProgress(Math.min(Math.round(progress), 100));
            
            ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
            lastTime = currentTime;
          }
          
          requestAnimationFrame(processFrame);
        }
      };

      mediaRecorder.onstop = () => {
        const webmBlob = new Blob(chunks, { type: 'video/webm' });
        setOptimizedVideo(webmBlob);
        setProgress(100);
        setStatus({
          type: 'success',
          message: '¡Video optimizado exitosamente!'
        });
        setProcessingVideo(false);

        // Cleanup
        URL.revokeObjectURL(videoElement.src);
        stream.getTracks().forEach(track => track.stop());
        videoElement.remove();
      };

      videoElement.onended = () => {
        mediaRecorder.stop();
      };

      // Iniciar procesamiento
      mediaRecorder.start(1000); // Guardar chunks cada segundo
      videoElement.play();
      processFrame();

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

  const formatSize = (bytes) => {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: isDragging ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          cursor: 'pointer',
          position: 'relative'
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {processingVideo ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              p: 3
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
        ) : (
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
              <>
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
                      secondary={`Tamaño original: ${formatSize(videoFile.size)}`}
                    />
                  </ListItem>
                </List>

                {optimizedVideo && (
                  <>
                    <Divider sx={{ width: '100%', my: 2 }} />
                    <List sx={{ width: '100%' }}>
                      <ListItem
                        secondaryAction={
                          <Button
                            onClick={handleDownload}
                            startIcon={<DownloadIcon />}
                            variant="contained"
                            color="primary"
                          >
                            Descargar
                          </Button>
                        }
                      >
                        <ListItemIcon>
                          <VideoFileIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Video Optimizado"
                          secondary={`Tamaño optimizado: ${formatSize(optimizedVideo.size)}`}
                        />
                      </ListItem>
                    </List>
                  </>
                )}
                
                {!optimizedVideo && !processingVideo && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={compressVideo}
                    startIcon={<CheckCircleIcon />}
                    sx={{ mt: 2 }}
                  >
                    Optimizar Video
                  </Button>
                )}
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default VideoOptimizer;


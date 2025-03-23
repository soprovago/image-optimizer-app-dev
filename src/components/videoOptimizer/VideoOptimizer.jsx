import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Container,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Styled component para ocultar el input nativo de archivo
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Styled component para la zona de arrastrar y soltar
const DropZone = styled(Paper)(({ theme, isDragActive, hasFile }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  minHeight: 250,
  borderWidth: 2,
  borderRadius: theme.shape.borderRadius,
  borderColor: isDragActive
    ? theme.palette.primary.main
    : hasFile
      ? theme.palette.success.main
      : theme.palette.divider,
  borderStyle: 'dashed',
  backgroundColor: isDragActive
    ? theme.palette.action.hover
    : hasFile
      ? theme.palette.success.light
      : theme.palette.background.paper,
  cursor: 'pointer',
  transition: theme.transitions.create([
    'border-color',
    'background-color'
  ]),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.main,
  },
}));

const VideoOptimizer = () => {
  // FFmpeg instance
  const ffmpegRef = useRef(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(true);
  const [ffmpegError, setFfmpegError] = useState(null);

  // Estados
  const [file, setFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [optimizedSize, setOptimizedSize] = useState(0);
  const [optimizedFile, setOptimizedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optimized, setOptimized] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [compressionStatus, setCompressionStatus] = useState('');

  // Initialize FFmpeg on component mount
  useEffect(() => {
  const initializeFFmpeg = async () => {
      try {
        setFfmpegLoading(true);
        ffmpegRef.current = new FFmpeg({ 
          log: true,
          progress: ({ ratio }) => {
            if (ratio < 0 || ratio > 1) return;
            setProgress(Math.floor(ratio * 100));
          },
          corePath: 'https://unpkg.com/@ffmpeg/core/dist/ffmpeg-core.js',
          logger: ({ message }) => {
            console.log(`[FFmpeg] ${message}`);
          },
          // CORS configuration
          fetchOptions: {
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Cross-Origin-Embedder-Policy': 'require-corp',
              'Cross-Origin-Opener-Policy': 'same-origin'
            }
          }
        });
        
        console.log('Loading FFmpeg...');
        
        // Add timeout to detect hanging load process
        const loadPromise = ffmpegRef.current.load();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('FFmpeg load timeout - took too long to load')), 30000);
        });
        
        await Promise.race([loadPromise, timeoutPromise]);
        
        // Perform a simple test to ensure FFmpeg is actually working
        try {
          await ffmpegRef.current.fs('writeFile', 'test.txt', new Uint8Array([1, 2, 3]));
          await ffmpegRef.current.fs('readFile', 'test.txt');
          await ffmpegRef.current.fs('unlink', 'test.txt');
        } catch (e) {
          throw new Error(`FFmpeg file system test failed: ${e.message}`);
        }

        console.log('FFmpeg loaded successfully');
        setFfmpegLoaded(true);
      } catch (error) {
        console.error('Error initializing FFmpeg:', error);
        let errorMessage = 'No se pudo inicializar FFmpeg: ' + error.message;
        
        // Provide more specific error messages for common issues
        if (error.message.includes('timeout')) {
          errorMessage = 'La carga de FFmpeg tomó demasiado tiempo. Verifica tu conexión a internet y vuelve a intentar.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'No se pudieron cargar los archivos necesarios de FFmpeg. Verifica tu conexión a internet.';
        } else if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
          errorMessage = 'Error de permisos CORS al cargar FFmpeg. El navegador está bloqueando la carga de recursos necesarios. Intenta con otro navegador o verifica la configuración del servidor.';
        }
        
        setFfmpegError(errorMessage);
        showSnackbar(`Error al inicializar el compresor de video: ${errorMessage}`, 'error');
      } finally {
        setFfmpegLoading(false);
      }
    };

    initializeFFmpeg();

    // Cleanup function
    return () => {
      // No need to call exit() in the browser environment
      // Just clean up the reference
      ffmpegRef.current = null;
    };
  }, []);

  // Función para mostrar notificaciones
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, [setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen]);

  // Función para cerrar notificaciones
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Función principal para optimizar video con FFmpeg
  const optimizeVideo = useCallback((file) => {
    // Validar que el archivo sea un MP4
    if (file.type !== 'video/mp4') {
      showSnackbar('Por favor, selecciona un archivo MP4 válido.', 'error');
      return Promise.reject('Tipo de archivo inválido');
    }
    
    // Verificar si FFmpeg está cargado
    if (!ffmpegLoaded || !ffmpegRef.current) {
      const errorMessage = ffmpegError || 'El compresor de video no está listo. Por favor, espera o recarga la página.';
      showSnackbar(errorMessage, 'error');
      return Promise.reject(errorMessage);
    }

    setLoading(true);
    setProgress(0);
    setCompressionStatus('Iniciando compresión...');
    
    // Guardar tamaño original
    const originalSizeInMB = file.size / (1024 * 1024);
    setOriginalSize(originalSizeInMB);

    // Proceso real de optimización con FFmpeg
    return new Promise(async (resolve, reject) => {
      try {
        const ffmpeg = ffmpegRef.current;
        const fileName = file.name;
        const outputFileName = `compressed_${fileName}`;
        
        // Escribir el archivo en el sistema de archivos virtual de FFmpeg
        setCompressionStatus('Preparando el video...');
        ffmpeg.fs('writeFile', fileName, await fetchFile(file));
        
        // Ejecutar FFmpeg para comprimir el video
        setCompressionStatus('Comprimiendo video...');
        
        // Compresión con configuración de calidad media-alta
        await ffmpeg.exec(
          '-i', fileName,
          '-c:v', 'libx264',          // Codec de video H.264
          '-crf', '23',               // Factor de calidad constante (18-28 es un buen rango, menor = mejor calidad)
          '-preset', 'medium',        // Velocidad de compresión vs calidad (slow = mejor compresión pero más lento)
          '-c:a', 'aac',              // Codec de audio AAC
          '-b:a', '128k',             // Bitrate de audio
          '-movflags', '+faststart',  // Optimiza para reproducción web
          outputFileName
        );
        
        // Leer el archivo comprimido
        setCompressionStatus('Finalizando...');
        const data = ffmpeg.fs('readFile', outputFileName);
        
        // Crear un Blob y un File con el resultado
        const optimizedBlob = new Blob([data.buffer], { type: 'video/mp4' });
        const optimizedFileObj = new File([optimizedBlob], `optimized_${file.name}`, { type: 'video/mp4' });
        
        // Calcular el tamaño optimizado
        const newSize = optimizedFileObj.size / (1024 * 1024);
        setOptimizedSize(newSize);
        
        // Liberar memoria
        ffmpeg.fs('unlink', fileName);
        ffmpeg.fs('unlink', outputFileName);
        
        setOptimizedFile(optimizedFileObj);
        setLoading(false);
        setOptimized(true);
        setCompressionStatus('');
        showSnackbar('Video optimizado correctamente', 'success');
        resolve(optimizedFileObj);
        
      } catch (error) {
        console.error('Error comprimiendo video:', error);
        setLoading(false);
        setCompressionStatus('');
        showSnackbar(`Error al comprimir: ${error.message}`, 'error');
        reject(error);
      }
    });
  }, [ffmpegLoaded, showSnackbar]);

  // Manejador principal para archivos
  const handleFile = useCallback((file) => {
    if (!file) return;
    
    setFile(file);
    setOptimized(false);
    setCompressionStatus('');
    
    optimizeVideo(file).catch(error => {
      setLoading(false);
      setCompressionStatus('');
      showSnackbar(`Error al optimizar: ${error.message || error}`, 'error');
      console.error('Error al optimizar:', error);
    });
  }, [optimizeVideo]);

  // Manejador para el cambio en el input de archivo
  const handleFileChange = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  // Manejadores para el arrastrar y soltar
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragActive(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragActive(false);
  }, []);

  // Manejador para descargar el archivo optimizado
  const handleDownload = useCallback(() => {
    if (!optimizedFile) {
      showSnackbar('No hay archivo optimizado para descargar', 'error');
      return;
    }
    
    const url = URL.createObjectURL(optimizedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `optimized_${optimizedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showSnackbar('Descarga iniciada', 'info');
  }, [optimizedFile, showSnackbar]);

  // Manejador para reiniciar el proceso
  const handleReset = useCallback(() => {
    setFile(null);
    setOptimizedFile(null);
    setOptimized(false);
    setOriginalSize(0);
    setOptimizedSize(0);
  }, []);

  // Formatear el tamaño en MB con 2 decimales
  const formatSize = (sizeInMB) => {
    return sizeInMB.toFixed(2);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Optimizador de Video
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
        Consigue que tu video pese menos y, al mismo tiempo, mantener la máxima calidad posible. Optimiza tus archivos MP4.
        </Typography>
        
        {ffmpegError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {ffmpegError}
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }} 
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </Alert>
        )}
        
        {ffmpegLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1">Cargando componentes de compresión de video...</Typography>
          </Box>
        ) : !file || !optimized ? (
          <DropZone
            isDragActive={isDragActive}
            hasFile={Boolean(file)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <VideoFileIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress variant="determinate" value={progress} size={60} sx={{ mb: 2 }} />
                <Typography variant="h6">Optimizando video...</Typography>
                <Typography variant="body2" color="text.secondary">
                  {progress}% completado
                </Typography>
                {compressionStatus && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {compressionStatus}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6">
                  {isDragActive
                    ? 'Suelta el archivo de video aquí'
                    : file
                      ? `Archivo seleccionado: ${file.name}`
                      : 'Arrastra y suelta un archivo MP4 aquí'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  o
                </Typography>
                
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                >
                  Seleccionar archivo MP4
                  <VisuallyHiddenInput
                    type="file"
                    accept="video/mp4"
                    onChange={handleFileChange}
                  />
                </Button>
              </Box>
            )}
          </DropZone>
        ) : ffmpegLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              ¡Video optimizado exitosamente!
            </Alert>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Archivo original</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {file.name}
                  </Typography>
                  <Typography variant="h6">
                    {formatSize(originalSize)} MB
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Archivo optimizado</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {optimizedFile ? optimizedFile.name : ''}
                  </Typography>
                  <Typography variant="h6">
                    {formatSize(optimizedSize)} MB
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  Reducción: {Math.round(((originalSize - optimizedSize) / originalSize) * 100)}%
                </Typography>
              </Box>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleDownload}
              >
                Descargar video optimizado
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
              >
                Optimizar otro video
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VideoOptimizer;


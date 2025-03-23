import React, { useState, useCallback } from 'react';
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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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

const PdfOptimizer = () => {
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

  // Función principal para optimizar PDF
  const optimizePdf = useCallback((file) => {
    // Validar que el archivo sea un PDF
    if (file.type !== 'application/pdf') {
      showSnackbar('Por favor, selecciona un archivo PDF válido.', 'error');
      return Promise.reject('Tipo de archivo inválido');
    }

    setLoading(true);
    setProgress(0);
    
    // Guardar tamaño original
    const originalSizeInMB = file.size / (1024 * 1024);
    setOriginalSize(originalSizeInMB);

    // Simulación de proceso de optimización
    return new Promise((resolve) => {
      const totalSteps = 10;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep += 1;
        const newProgress = Math.round((currentStep / totalSteps) * 100);
        setProgress(newProgress);
        
        if (currentStep >= totalSteps) {
          clearInterval(interval);
          
          // Simulación de resultado con reducción aleatoria entre 30-70%
          const reductionFactor = Math.random() * 0.4 + 0.3; // 30-70%
          const newSize = originalSizeInMB * (1 - reductionFactor);
          setOptimizedSize(newSize);
          
          // Crear un nuevo Blob para simular el archivo optimizado
          const reader = new FileReader();
          reader.readAsArrayBuffer(file);
          reader.onload = () => {
            const optimizedBlob = new Blob([reader.result], { type: 'application/pdf' });
            const optimizedFileObj = new File([optimizedBlob], file.name, { type: 'application/pdf' });
            
            setOptimizedFile(optimizedFileObj);
            setLoading(false);
            setOptimized(true);
            showSnackbar('PDF optimizado correctamente', 'success');
            resolve(optimizedFileObj);
          };
        }
      }, 300);
    });
  }, [showSnackbar]);

  // Manejador principal para archivos
  const handleFile = useCallback((file) => {
    if (!file) return;
    
    setFile(file);
    setOptimized(false);
    
    optimizePdf(file).catch(error => {
      setLoading(false);
      console.error('Error al optimizar:', error);
    });
  }, [optimizePdf]);

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
          Optimizador de PDF
        </Typography>
        
        <Typography variant="body1" paragraph align="center">
        Consigue que tu documento PDF pese menos y, al mismo tiempo, mantener la máxima calidad posible. Optimiza tus archivos PDF.
        </Typography>
        
        {!file || !optimized ? (
          <DropZone
            isDragActive={isDragActive}
            hasFile={Boolean(file)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <PictureAsPdfIcon fontSize="large" color="primary" sx={{ mb: 2 }} />
            
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress variant="determinate" value={progress} size={60} sx={{ mb: 2 }} />
                <Typography variant="h6">Optimizando PDF...</Typography>
                <Typography variant="body2" color="text.secondary">
                  {progress}% completado
                </Typography>
              </Box>
            ) : (
              <>
                <Typography variant="h6">
                  {isDragActive
                    ? 'Suelta el archivo PDF aquí'
                    : file
                      ? `Archivo seleccionado: ${file.name}`
                      : 'Arrastra y suelta un archivo PDF aquí'}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  o
                </Typography>
                
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                >
                  Seleccionar archivo PDF
                  <VisuallyHiddenInput
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </Button>
              </>
            )}
          </DropZone>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              ¡PDF optimizado exitosamente!
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
                Descargar PDF optimizado
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
              >
                Optimizar otro PDF
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

export default PdfOptimizer;

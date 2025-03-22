import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { optimizeImage as optimizeImageService } from '../../services/imageService';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  FormControlLabel,
  Switch,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Snackbar,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';

const ImageOptimizer = () => {
  const [images, setImages] = useState([]);
  const [optimizedImages, setOptimizedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    maxWidth: 1920,
    quality: 80,
    maintainAspectRatio: true,
    format: 'jpeg'
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      const newImages = acceptedFiles
        .filter(file => file.type.startsWith('image/'))
        .map(file => ({
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          type: file.type,
          id: Date.now() + Math.random().toString(36).substr(2, 9)
        }));

      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
        setOptimizedImages(prev => [...prev, ...Array(newImages.length).fill(null)]);
        setLoadingImages(prev => [...prev, ...Array(newImages.length).fill(false)]);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: true
  });

  const handleSettingsChange = (setting) => (event, newValue) => {
    setSettings(prev => ({
      ...prev,
      [setting]: setting === 'maintainAspectRatio' 
                ? event.target.checked 
                : setting === 'format' 
                ? event.target.value 
                : newValue
    }));
  };

  const optimizeImage = async (index) => {
    const imageToOptimize = images[index];
    if (!imageToOptimize) return;

    setLoadingImages(prev => {
      const newLoadingImages = [...prev];
      newLoadingImages[index] = true;
      return newLoadingImages;
    });

    try {
      const result = await optimizeImageService(
        imageToOptimize.file,
        settings.quality,
        settings.format
      );

      const optimizedImageData = {
        preview: result.preview,
        size: result.newSize,
        type: `image/${settings.format}`
      };

      setOptimizedImages(prev => {
        const newOptimizedImages = [...prev];
        newOptimizedImages[index] = optimizedImageData;
        return newOptimizedImages;
      });
    } catch (error) {
      console.error('Error al optimizar la imagen:', error);
      setError(`Error al optimizar la imagen: ${error.message}`);
    } finally {
      setLoadingImages(prev => {
        const newLoadingImages = [...prev];
        newLoadingImages[index] = false;
        return newLoadingImages;
      });
    }
  };

  const optimizeAllImages = async () => {
    setLoading(true);
    
    // Set all images to loading state
    setLoadingImages(prev => prev.map(() => true));
    
    try {
      const optimizationPromises = images.map((_, index) => {
        if (!optimizedImages[index]) {
          return optimizeImage(index);
        }
        return Promise.resolve();
      });
      
      await Promise.all(optimizationPromises);
    } catch (error) {
      console.error('Error al optimizar las imágenes:', error);
      setError('Error al optimizar múltiples imágenes: ' + error.message);
    } finally {
      setLoading(false);
      
      // Reset all image loading states
      setLoadingImages(prev => prev.map(() => false));
    }
  };

  const handleDownload = (index) => {
    const optimizedImage = optimizedImages[index];
    const originalImage = images[index];
    if (optimizedImage && originalImage) {
      const extension = settings.format === 'webp' ? '.webp' : 
                      settings.format === 'png' ? '.png' : '.jpg';
      const link = document.createElement('a');
      link.href = optimizedImage.preview;
      link.download = `optimized_${originalImage.name.split('.')[0]}${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAll = () => {
    optimizedImages.forEach((optimizedImage, index) => {
      if (optimizedImage) {
        handleDownload(index);
      }
    });
  };

  const handleDownloadAllAsZip = async () => {
    try {
      setLoading(true);
      const zip = new JSZip();
      
      // Create an array of promises to fetch all the optimized images
      const imagePromises = optimizedImages.map(async (optimizedImage, index) => {
        if (!optimizedImage) return null;
        
        const originalImage = images[index];
        const extension = settings.format === 'webp' ? '.webp' : 
                          settings.format === 'png' ? '.png' : '.jpg';
        const fileName = `optimized_${originalImage.name.split('.')[0]}${extension}`;
        
        try {
          // Fetch the blob from the optimized image URL
          const response = await fetch(optimizedImage.preview);
          const blob = await response.blob();
          return { fileName, blob };
        } catch (error) {
          console.error(`Error fetching image ${fileName}:`, error);
          return null;
        }
      });
      
      // Wait for all image fetches to complete
      const imageData = await Promise.all(imagePromises);
      
      // Add each successfully fetched image to the zip
      imageData.forEach(data => {
        if (data) {
          zip.file(data.fileName, data.blob);
        }
      });
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link for the zip file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `optimized_images_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error creating zip file:', error);
      setError(`Error al crear el archivo zip: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
    
    setOptimizedImages(prev => {
      const newOptimizedImages = [...prev];
      newOptimizedImages.splice(index, 1);
      return newOptimizedImages;
    });
  };

  const handleReset = () => {
    setImages([]);
    setOptimizedImages([]);
    setLoadingImages([]);
    setSelectedImageIndex(null);
  };

  const handleImageSelect = (index) => {
    setSelectedImageIndex(prevIndex => prevIndex === index ? null : index);
  };

  const handleCloseError = () => {
    setError(null);
  };

  // Clean up object URLs when component unmounts or when images change
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.preview) URL.revokeObjectURL(image.preview);
      });
      optimizedImages.forEach(image => {
        if (image?.preview) URL.revokeObjectURL(image.preview);
      });
    };
  }, [images, optimizedImages]);
  return (
    <Box sx={{ py: 4 }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          mb: 3
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Arrastra y suelta imágenes aquí, o haz clic para seleccionar
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Soporta JPEG, PNG, WebP y GIF (Se permiten múltiples archivos)
        </Typography>
      </Paper>

      {images.length > 0 && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ajustes de Optimización
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Ancho Máximo (px)</Typography>
              <Slider
                value={settings.maxWidth}
                onChange={handleSettingsChange('maxWidth')}
                min={100}
                max={3840}
                step={100}
                marks={[
                  { value: 100, label: '100' },
                  { value: 1920, label: '1920' },
                  { value: 3840, label: '3840' }
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Calidad (%)</Typography>
              <Slider
                value={settings.quality}
                onChange={handleSettingsChange('quality')}
                min={1}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintainAspectRatio}
                  onChange={handleSettingsChange('maintainAspectRatio')}
                />
              }
              label="Mantener Proporción"
            />
            <Box sx={{ mt: 2 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Formato de Salida</FormLabel>
                <RadioGroup
                  row
                  value={settings.format}
                  onChange={handleSettingsChange('format')}
                >
                  <FormControlLabel 
                    value="jpeg" 
                    control={<Radio />} 
                    label="JPEG" 
                  />
                  <FormControlLabel 
                    value="png" 
                    control={<Radio />} 
                    label="PNG" 
                  />
                  <FormControlLabel 
                    value="webp" 
                    control={<Radio />} 
                    label="WebP" 
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Paper>

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Imágenes Cargadas ({images.length})</Typography>
            <Box>
              <Button 
                variant="contained" 
                onClick={optimizeAllImages} 
                disabled={loading || images.length === 0}
                sx={{ mr: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Optimizar Todas las Imágenes'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={handleReset}
                disabled={loading}
              >
                Reiniciar Todo
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={image.id || index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    boxShadow: selectedImageIndex === index ? '0 0 0 2px #ff1b6d' : undefined,
                    '&:hover': { boxShadow: '0 0 0 2px #ff1b6d' }
                  }}
                  onClick={() => handleImageSelect(index)}
                >
                  <CardMedia
                    component="img"
                    image={image.preview}
                    alt={`Image ${index + 1}`}
                    sx={{ height: 200, objectFit: 'contain' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" noWrap>
                      {image.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Original: {(image.size / 1024).toFixed(2)} KB
                    </Typography>
                    {optimizedImages[index] && (
                      <Typography variant="body2" color="success.main">
                        Optimizado: {(optimizedImages[index].size / 1024).toFixed(2)} KB
                        {image.size > 0 && (
                          <span> ({(100 - (optimizedImages[index].size / image.size) * 100).toFixed(0)}% más pequeño)</span>
                        )}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        optimizeImage(index);
                      }}
                      disabled={loadingImages[index] || loading}
                    >
                      {loadingImages[index] ? 
                        <CircularProgress size={16} /> : 
                        'Optimizar'
                      }
                    </Button>
                    {optimizedImages[index] && (
                      <Button 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(index);
                        }}
                        disabled={loadingImages[index]}
                        startIcon={<DownloadIcon />}
                      >
                        Descargar
                      </Button>
                    )}
                    <Button 
                      size="small" 
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      disabled={loadingImages[index]}
                      startIcon={<DeleteIcon />}
                    >
                      Eliminar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {optimizedImages.some(img => img !== null) && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadAll}
                disabled={loading}
              >
                Descargar Todas Individualmente
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadAllAsZip}
                disabled={loading}
              >
                Descargar Como ZIP
              </Button>
            </Box>
          )}
        </>
      )}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ImageOptimizer;

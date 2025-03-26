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
  const videoRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
    }
  };

  const compressVideo = async () => {
    if (!videoFile) return;
    
    try {
      setProcessingVideo(true);
      setStatus('Iniciando compresión...');
      setProgress(0);

      // Verificar soporte de WebCodecs
      if (!('VideoEncoder' in window)) {
        throw new Error('WebCodecs API no está soportada en este navegador');
      }

      // Crear elemento de video para el source
      const sourceVideo = document.createElement('video');
      sourceVideo.src = URL.createObjectURL(videoFile);
      
      // Esperar a que los metadatos del video estén cargados
      await new Promise((resolve) => {
        sourceVideo.onloadedmetadata = resolve;
      });

      // Configurar dimensiones
      const targetWidth = Math.floor(sourceVideo.videoWidth * scale);
      const targetHeight = Math.floor(sourceVideo.videoHeight * scale);

      // Crear canvas para el procesamiento
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Array para almacenar los chunks codificados
      const encodedChunks = [];

      // Configurar el encoder
      const videoEncoder = new VideoEncoder({
        output: async (chunk, metadata) => {
          encodedChunks.push(chunk);
          const currentProgress = (metadata.timestamp / (sourceVideo.duration * 1000000)) * 100;
          setProgress(Math.min(Math.floor(currentProgress), 100));
        },
        error: (error) => {
          console.error(error);
          setStatus('Error durante la codificación: ' + error.message);
        }
      });

      // Función para obtener la configuración de codec soportada
      const getCodecConfig = async () => {
        const codecs = [
          'avc1.42E01E', // H.264 baseline
          'vp09.00.10.08', // VP9
          'vp8' // VP8
        ];

        for (const codec of codecs) {
          try {
            const support = await VideoEncoder.isConfigSupported({
              codec,
              width: targetWidth,
              height: targetHeight,
              bitrate: 1_000_000 * (quality / 100),
              framerate: 30
            });

            if (support.supported) {
              return {
                codec,
                width: targetWidth,
                height: targetHeight,
                bitrate: 1_000_000 * (quality / 100),
                framerate: 30,
                // Añadir configuraciones específicas para mejor calidad
                ...(codec.startsWith('avc1') && {
                  avc: { format: 'annexb' },
                  hardwareAcceleration: 'prefer'
                })
              };
            }
          } catch (e) {
            console.warn(`Codec ${codec} no soportado:`, e);
          }
        }
        throw new Error('No se encontró ningún codec compatible');
      };

      // Obtener configuración de codec compatible
      const config = await getCodecConfig();
      await videoEncoder.configure(config);
      setStatus('Procesando video...');

      // Procesar frames
      const frameRate = 30;
      const frameDuration = 1000000 / frameRate; // en microsegundos
      
      // Función para procesar un frame
      const processFrame = async (timestamp) => {
        ctx.drawImage(sourceVideo, 0, 0, targetWidth, targetHeight);
        const imageBitmap = await createImageBitmap(canvas);
        const frame = new VideoFrame(imageBitmap, {
          timestamp: Math.floor(timestamp * 1000000),
          duration: frameDuration
        });
        await videoEncoder.encode(frame);
        frame.close();
        imageBitmap.close();
      };

      // Procesar video en chunks para mejor rendimiento
      const chunkSize = 1; // segundos por chunk
      for (let time = 0; time < sourceVideo.duration; time += chunkSize) {
        setStatus(`Procesando chunk ${Math.floor(time/chunkSize) + 1} de ${Math.ceil(sourceVideo.duration/chunkSize)}...`);
        sourceVideo.currentTime = time;
        await new Promise(resolve => { sourceVideo.onseeked = resolve; });
        
        const endTime = Math.min(time + chunkSize, sourceVideo.duration);
        while (sourceVideo.currentTime < endTime) {
          await processFrame(sourceVideo.currentTime);
          sourceVideo.currentTime += 1/frameRate;
        }
      }

      // Finalizar la codificación
      await videoEncoder.flush();
      videoEncoder.close();

      // Crear el archivo final con el tipo MIME adecuado según el codec
      const mimeType = config.codec.startsWith('avc1') ? 'video/mp4' : 'video/webm';
      const extension = mimeType === 'video/mp4' ? 'mp4' : 'webm';
      const blob = new Blob(encodedChunks, { type: `${mimeType}; codecs=${config.codec}` });
      const url = URL.createObjectURL(blob);

      // Crear enlace de descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-optimizado-${quality}calidad-${scale}x.${extension}`;
      a.click();

      setStatus('¡Video optimizado con éxito!');
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
      
      <input
        accept="video/*"
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="video-input"
      />
      
      <Box sx={{ my: 2 }}>
        <label htmlFor="video-input">
          <Button variant="contained" component="span">
            Seleccionar Video
          </Button>
        </label>
      </Box>

      {videoFile && (
        <>
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
        </>
      )}
    </Box>
  );
};

export default VideoOptimizer;


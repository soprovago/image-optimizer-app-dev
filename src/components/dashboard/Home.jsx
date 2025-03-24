import React from 'react';
import { Box, Typography, Container, Grid, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoFileIcon from '@mui/icons-material/VideoFile';

// Styled components
const WelcomeBanner = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
}));

const ToolCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  minHeight: 340,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  textAlign: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
  '& .MuiTypography-body2': {
    margin: theme.spacing(2, 0),
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  borderRadius: '50%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const ToolButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const Home = () => {
  const navigate = useNavigate();
  return (
    <>
      {/* Welcome Banner */}
      <Box sx={{ position: 'relative', overflow: 'visible' }}>
        <WelcomeBanner elevation={3}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Estas en la suite de wemax
          </Typography>
          <Typography variant="subtitle1">
            Convierte archivos multimedia online de un formato a otro. Por favor, selecciona el formato de destino.
          </Typography>
        </WelcomeBanner>
      </Box>

      {/* Tools Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Herramientas disponibles
        </Typography>
        
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          {/* Image Optimizer Tool Card */}
          <Grid item xs={12} sm={6} md={4}>
            <ToolCard 
              onClick={() => navigate('optimize')}
              sx={{ 
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <IconContainer sx={{
                backgroundColor: (theme) => theme.palette.primary.light,
                width: (theme) => theme.spacing(8),
                height: (theme) => theme.spacing(8),
                mb: 3,
                '& > svg': {
                  fontSize: '2.5rem',
                }
              }}>
                <ImageIcon fontSize="large" />
              </IconContainer>
              <Typography variant="h6" component="h3" gutterBottom>
                Optimiza Imágenes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Reduce el tamaño de tus imágenes sin perder calidad. Optimiza tus imágenes para web y mejora la velocidad de carga.
              </Typography>
              <ToolButton 
                variant="contained" 
                color="primary"
                fullWidth
              >
                Usar herramienta
              </ToolButton>
            </ToolCard>
          </Grid>

          {/* PDF Optimizer Tool Card */}
          <Grid item xs={12} sm={6} md={4}>
            <ToolCard 
              onClick={() => navigate('pdf')}
              sx={{ 
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <IconContainer sx={{
                backgroundColor: (theme) => theme.palette.primary.light,
                width: (theme) => theme.spacing(8),
                height: (theme) => theme.spacing(8),
                mb: 3,
                '& > svg': {
                  fontSize: '2.5rem',
                }
              }}>
                <PictureAsPdfIcon fontSize="large" />
              </IconContainer>
              <Typography variant="h6" component="h3" gutterBottom>
                Optimiza PDF
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Reduce el tamaño de tus archivos PDF manteniendo la calidad. Optimiza tus documentos para compartir y almacenar.
              </Typography>
              <ToolButton 
                variant="contained" 
                color="primary"
                fullWidth
              >
                Usar herramienta
              </ToolButton>
            </ToolCard>
          </Grid>

          {/* Video Optimizer Tool Card */}
          <Grid item xs={12} sm={6} md={4}>
            <ToolCard 
              onClick={() => navigate('video')}
              sx={{ 
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <IconContainer sx={{
                backgroundColor: (theme) => theme.palette.primary.light,
                width: (theme) => theme.spacing(8),
                height: (theme) => theme.spacing(8),
                mb: 3,
                '& > svg': {
                  fontSize: '2.5rem',
                }
              }}>
                <VideoFileIcon fontSize="large" />
              </IconContainer>
              <Typography variant="h6" component="h3" gutterBottom>
                Optimiza Video
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                Reduce el tamaño de tus archivos MP4 conservando la calidad. Optimiza tus videos para compartir en línea y ahorrar espacio.
              </Typography>
              <ToolButton 
                variant="contained" 
                color="primary"
                fullWidth
              >
                Usar herramienta
              </ToolButton>
            </ToolCard>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Home;


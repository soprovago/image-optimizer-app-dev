import React from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Alert,
  CssBaseline,
  GlobalStyles
} from '@mui/material';
import reactLogo from '../../assets/wemax_logo.svg';
const AuthLayout = ({ title, error, children }) => {
  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          'html, body': {
            overflow: 'hidden',
            margin: 0,
            padding: 0,
            height: '100%',
            width: '100%'
          }
        }}
      />
      <Box
        sx={(theme) => ({
          height: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.background.default,
          overflow: 'hidden'
        })}
      >
        <Container 
          component="main" 
          maxWidth="xs" 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: '0 16px',
            mt: '-50px'  // Add negative margin-top to move the form up
          }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '450px',
            }}
          >
            <Paper
              elevation={0}
              sx={(theme) => ({
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                backgroundColor: 'transparent',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: 'none',
                backdropFilter: 'none',
                '& .MuiPaper-root': {
                  backgroundColor: 'transparent'
                }
              })}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, width: '100%' }}>
                  <img src={reactLogo} alt="Logo" style={{ height: 60 }} />
                </Box>
                <Typography 
                  component="h1" 
                  variant="h4" 
                  fontWeight="300" 
                  align="center" 
                  sx={(theme) => ({ 
                    color: theme.palette.text.primary
                  })}
                >
                  {title}
                </Typography>
              </Box>
              {error && (
                <Alert severity="error" sx={{ mt: 1, width: '100%', mb: 1 }}>
                  {error}
                </Alert>
              )}
              {children}
            </Paper>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default AuthLayout;


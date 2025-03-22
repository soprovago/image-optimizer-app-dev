import React, { useState } from 'react';
import { 
  TextField,
  Button,
  Link,
  Box,
  useTheme
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from './AuthLayout';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Iniciar sesión en la plataforma" error={error}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Correo Electrónico"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': { 
              borderRadius: '8px',
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main
              }
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary
            },
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
              WebkitTextFillColor: `${theme.palette.text.primary} !important`,
              caretColor: `${theme.palette.text.primary}`,
              backgroundColor: 'transparent !important'
            }
          }}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Contraseña"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': { 
              borderRadius: '8px',
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main
              }
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary
            },
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary
            },
            '& input:-webkit-autofill': {
              WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
              WebkitTextFillColor: `${theme.palette.text.primary} !important`,
              caretColor: `${theme.palette.text.primary}`,
              backgroundColor: 'transparent !important'
            }
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ 
            mt: 3, 
            mb: 2,
            py: 1.2,
            borderRadius: '8px',
            fontWeight: 'bold',
            textTransform: 'none',
            fontSize: '1rem',
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          disabled={loading}
        >
          Iniciar Sesión
        </Button>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link 
            component={RouterLink} 
            to="/register" 
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
                color: theme.palette.primary.light
              },
              transition: 'color 0.3s ease'
            }}
          >
            {"¿No tienes una cuenta? Regístrate"}
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Login;

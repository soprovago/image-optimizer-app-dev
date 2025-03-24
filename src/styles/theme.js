import { createTheme } from '@mui/material';

const commonTheme = {
  typography: {
    fontFamily: 'var(--font-primary)',
    h1: {
      fontFamily: 'var(--font-secondary)',
    },
    h2: {
      fontFamily: 'var(--font-secondary)',
    },
    h3: {
      fontFamily: 'var(--font-secondary)',
    },
    h4: {
      fontFamily: 'var(--font-secondary)',
    },
    h5: {
      fontFamily: 'var(--font-secondary)',
    },
    h6: {
      fontFamily: 'var(--font-secondary)',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: 'var(--font-secondary)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input:-webkit-autofill': {
            '-webkit-box-shadow': '0 0 0 100px transparent inset',
            '-webkit-text-fill-color': 'inherit',
            'transition': 'background-color 5000s ease-in-out 0s'
          }
        }
      }
    },
  },
};

export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#ff2473',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

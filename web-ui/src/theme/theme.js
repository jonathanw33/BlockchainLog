import { createTheme } from '@mui/material/styles';

// Creating a theme based on the welcome screen's color scheme
// The main colors are shades of blue, purple, and teal
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#64b5f6',
      main: '#1976d2',
      dark: '#0f2027',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ce93d8',
      main: '#9c27b0',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    info: {
      light: '#81c784',
      main: '#2c5364',
      dark: '#203a43',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    merkle: {
      root: '#1976d2',
      intermediate: '#9c27b0',
      leaf: '#2c5364',
      valid: '#4caf50',
      invalid: '#f44336',
    },
    logLevel: {
      INFO: '#2196f3',
      WARN: '#ff9800',
      ERROR: '#f44336',
      DEBUG: '#4caf50',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem', 
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(90deg, #7b1fa2 0%, #9c27b0 100%)',
          '&:hover': {
            background: 'linear-gradient(90deg, #6a1b9a 0%, #7b1fa2 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: '8px 8px 0 0',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: 'separate',
          borderSpacing: '0 4px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.04)',
          },
          '&.MuiTableRow-hover': {
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(25, 118, 210, 0.08)',
          color: '#1976d2',
        },
      },
    },
  },
});

export default theme;
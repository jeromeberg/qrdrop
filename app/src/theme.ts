import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'media',
  },
  colorSchemes: {
    light: {
      palette: {
        background: { default: '#f7f8fa', paper: '#ffffff' },
        primary: { main: '#1a73e8' },
      },
    },
    dark: {
      palette: {
        background: { default: '#121212', paper: '#1e1e1e' },
        primary: { main: '#8ab4f8' },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
  },
})

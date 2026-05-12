import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider
      theme={createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#4F46E5' },
          secondary: { main: '#0EA5E9' },
          background: { default: '#F8FAFC', paper: '#FFFFFF' },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        },
      })}
    >
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

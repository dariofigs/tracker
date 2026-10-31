import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { isDemo } from './demo/mode'
import { startThemeSync } from './lib/theme'

// Before the first render, so the page never flashes the wrong theme.
startThemeSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={isDemo ? '/demo' : undefined}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

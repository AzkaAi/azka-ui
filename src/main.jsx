import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Load the IIFE scripts in order
import './components/icons.jsx'
import './components/data.jsx'
import './components/cards.jsx'
import './components/panels.jsx'
import './components/app.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'
import { ApiStatusProvider } from './context/ApiStatusContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApiStatusProvider>
      <App />
    </ApiStatusProvider>
  </StrictMode>,
)

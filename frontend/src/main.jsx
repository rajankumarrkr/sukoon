import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Buffer } from 'buffer'
window.Buffer = Buffer
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { NotificationProvider } from './context/NotificationContext'
import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)

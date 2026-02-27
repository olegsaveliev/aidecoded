import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './AuthContext'
import { ReleaseProvider } from './ReleaseContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReleaseProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ReleaseProvider>
  </StrictMode>,
)

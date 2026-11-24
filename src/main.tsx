import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import BootGate from './components/BootGate'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BootGate>
        <App />
      </BootGate>
    </ErrorBoundary>
  </React.StrictMode>
)

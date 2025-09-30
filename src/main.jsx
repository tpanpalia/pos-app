import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ServiceWorkerManager } from './services/ServiceWorkerManager'

// Register service worker for offline functionality
ServiceWorkerManager.register()

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
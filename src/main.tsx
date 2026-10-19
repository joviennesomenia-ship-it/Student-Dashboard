import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { AppProvider } from './store'
import './index.css'

const qc = new QueryClient()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <MotionConfig reducedMotion="user"><AppProvider><App /></AppProvider></MotionConfig>
    </QueryClientProvider>
  </React.StrictMode>,
)

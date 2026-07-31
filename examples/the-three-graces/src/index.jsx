import { createRoot } from 'react-dom/client'
import React, { Suspense } from 'react'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <>
    <Suspense fallback={null}>
      <App />
    </Suspense>
    <div className="header">
      <span className="active">ART</span>
      <span>ABOUT</span>
      <span>VISIT</span>
      <span>SHOP</span>
    </div>
  </>,
)

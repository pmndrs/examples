import { createRoot } from 'react-dom'
import React from 'react'
import { Badge } from '@pmndrs/branding'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Badge />
  </>
)

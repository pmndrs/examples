import { createRoot } from 'react-dom/client'
import React from 'react'
import './styles.css'
import App from './App'
import Overlay from './Overlay'

createRoot(document.querySelector('#root')).render(
  <>
    <App />
    <Overlay />
  </>
)

import { createRoot } from 'react-dom'
import { Suspense } from 'react'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <Suspense fallback={null}>
    <App />
  </Suspense>
)

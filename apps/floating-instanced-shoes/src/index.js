import { createRoot } from 'react-dom/client'
import { Stats } from '@react-three/drei'
import './style.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Stats />
  </>,
)

import { createRoot } from 'react-dom/client'
import { Stats } from '@react-three/drei'
import { Leva } from 'leva'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Stats />
    <Leva collapsed />
  </>
)

import { createRoot } from 'react-dom/client'
import { Stats } from '@react-three/drei'
import { Leva } from 'leva'
import { App } from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Leva titleBar={{ title: 'SSR' }} collapsed />
    <Stats />
  </>
)

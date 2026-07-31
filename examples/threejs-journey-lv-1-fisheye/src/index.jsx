// Original and the models by Bruno Simon: https://threejs-journey.com

import { createRoot } from 'react-dom/client'
import { Loader } from '@react-three/drei'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Loader />
  </>,
)

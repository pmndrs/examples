import { createRoot } from 'react-dom/client'
import { useGLTF, useTexture } from '@react-three/drei'
import 'inter-ui'
import './styles.css'
import { App } from './App'
import { assetUrl } from './assetUrl'

useTexture.preload(assetUrl('textures/heightmap_1024.png'))
useGLTF.preload(assetUrl('models/track-draco.glb'))
useGLTF.preload(assetUrl('models/chassis-draco.glb'))
useGLTF.preload(assetUrl('models/wheel-draco.glb'))

createRoot(document.getElementById('root')!).render(<App />)

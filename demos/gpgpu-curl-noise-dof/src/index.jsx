import * as THREE from 'three'
import { createRoot, events, extend } from '@react-three/fiber'
import './styles.css'
import App from './App'

extend(THREE)

let root = null

window.addEventListener('resize', () => {
  if (root) root.unmount()
  root = createRoot(document.querySelector('canvas'))
  root.configure({
    events,
    flat: true,
    camera: { fov: 25, position: [0, 0, 6] },
    // https://barradeau.com/blog/?p=621
    // This examples needs WebGL1 (?)
    gl: new THREE.WebGL1Renderer({
      canvas: document.querySelector('canvas'),
      antialias: true,
      alpha: true
    })
  })
  root.render(<App />)
})

window.dispatchEvent(new Event('resize'))

import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import { Logo } from '@pmndrs/branding'

function Overlay() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <Logo style={{ position: 'absolute', bottom: 40, left: 40, width: 30 }} />
      <a href="https://pmnd.rs/" style={{ position: 'absolute', bottom: 40, left: 90, fontSize: '13px' }}>
        pmnd.rs
        <br />
        dev collective
      </a>
      <div style={{ position: 'absolute', top: 40, left: 40 }}>ok —</div>
      <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: '13px' }}>29/01/2023</div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <>
    <App
      spheres={[
        [1, 'orange', 0.05, [-4, -1, -1]],
        [0.75, 'hotpink', 0.1, [-4, 2, -2]],
        [1.25, 'aquamarine', 0.2, [4, -3, 2]],
        [1.5, 'lightblue', 0.3, [-4, -2, -3]],
        [2, 'pink', 0.3, [-4, 2, -4]],
        [2, 'skyblue', 0.3, [-4, 2, -4]],
        [1.5, 'orange', 0.05, [-4, -1, -1]],
        [2, 'hotpink', 0.1, [-4, 2, -2]],
        [1.5, 'aquamarine', 0.2, [4, -3, 2]],
        [1.25, 'lightblue', 0.3, [-4, -2, -3]],
        [1, 'pink', 0.3, [-4, 2, -4]],
        [1, 'skyblue', 0.3, [-4, 2, -4]]
      ]}
    />
    <Overlay />
  </>
)

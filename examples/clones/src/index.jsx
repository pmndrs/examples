import { createRoot } from 'react-dom/client'
import { Logo } from '@pmndrs/branding'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <div style={{ position: 'absolute', top: 40, left: 40 }}>
      <a href="https://github.com/pmndrs/lamina">clone</a> —
    </div>
    <div style={{ pointerEvents: 'none', position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', gap: 35, alignItems: 'center', padding: 40 }}>
      <Logo style={{ width: 30 }} />
      <div style={{ position: 'relative', flex: 1, marginLeft: 35, display: 'flex', alignItems: 'flex-end', gap: 35, justifyContent: 'space-between' }}>
        <div>
          pmnd.rs
          <br />
          dev collective
        </div>
        <div>20/03/2022</div>
      </div>
    </div>
  </>
)

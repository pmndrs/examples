import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Footer } from '@pmndrs/branding'
import './styles.css'
import App from './App'

function Overlay() {
  const [ready, set] = useState(false)
  return (
    <>
      {ready && <App />}
      <div className={`fullscreen bg ${ready ? 'ready' : 'notready'} ${ready && 'clicked'}`}>
        <div className="stack">
          <button onClick={() => set(true)}>▶️</button>
        </div>
      </div>
      <Footer date="2. September" year="2021" />
    </>
  )
}

createRoot(document.getElementById('root')).render(<Overlay />)

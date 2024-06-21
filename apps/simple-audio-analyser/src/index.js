import { useState } from 'react'
import ReactDOM from 'react-dom'
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

ReactDOM.render(<Overlay />, document.getElementById('root'))

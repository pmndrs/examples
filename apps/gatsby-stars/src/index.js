import ReactDOM from 'react-dom'
import { Logo } from '@pmndrs/branding'
import './styles.css'
import App from './App'

function Overlay() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
      <a href="https://pmnd.rs/" style={{ position: 'absolute', bottom: 40, left: 90, fontSize: '13px' }}>
        pmnd.rs
        <br />
        dev collective
      </a>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate3d(-50%,-50%,0)' }}>
        <h1 style={{ margin: 0, padding: 0, fontSize: '15em', fontWeight: 500, letterSpacing: '-0.05em' }}>hello</h1>
      </div>
      <div style={{ position: 'absolute', top: 40, left: 40, fontSize: '13px' }}>pretty bad —</div>
      <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: '13px' }}>25/02/2022</div>
    </div>
  )
}

ReactDOM.render(
  <>
    <App /> <Overlay />
    <Logo style={{ position: 'absolute', bottom: 40, left: 40, width: 30 }} />
  </>,
  document.getElementById('root')
)

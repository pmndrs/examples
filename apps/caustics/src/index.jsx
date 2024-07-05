import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import { Overlay } from './Overlay'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Overlay />
  </>
)

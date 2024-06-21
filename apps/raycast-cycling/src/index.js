import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import Underlay from './demo/Underlay'

createRoot(document.getElementById('root')).render(
  <>
    <Underlay />
    <App />
  </>
)

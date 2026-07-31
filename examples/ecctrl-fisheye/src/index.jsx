import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

import controlsImage from './controls.png'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <img className="controlKeys" src={controlsImage} alt="control keys" />
  </>,
)

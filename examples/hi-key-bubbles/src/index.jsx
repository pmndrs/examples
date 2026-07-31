import { createRoot } from 'react-dom/client'
import React from 'react'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <div className="overlay">
      <a className="https://docs.pmnd.rs/react-three-fiber/examples/showcase">
        <b>pmnd.rs</b>
      </a>
      <a className="right" href="https://codesandbox.io/s/kmb9i">
        /csb
      </a>
      <h2>
        Light, that creative agent
        <br />
        the vibrations of which are the movement
        <br />
        and life of all things —
      </h2>
    </div>
  </>
)

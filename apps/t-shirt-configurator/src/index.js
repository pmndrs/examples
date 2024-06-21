/*
Udemy course: https://www.udemy.com/course/react-three-fiber-configurator
*/

import { createRoot } from 'react-dom/client'
import './styles.css'
import { App as Canvas } from './Canvas'
import { Overlay } from './Overlay'

createRoot(document.getElementById('root')).render(
  <>
    <Canvas />
    <Overlay />
  </>
)

import { Children } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@pmndrs/branding'
import { useStore } from './store'

const container = {
  hidden: { opacity: 0, height: 0, transition: { staggerChildren: 0.05 } },
  show: {
    opacity: 1,
    height: 'auto',
    transition: { when: 'beforeChildren', staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: '100%' },
  show: { opacity: 1, y: 0 }
}

function List({ children, open }) {
  return (
    <motion.ul variants={container} initial="hidden" animate={open ? 'show' : 'hidden'}>
      {Children.map(children, (child) => (
        <li>
          <motion.div variants={item}>{child}</motion.div>
        </li>
      ))}
    </motion.ul>
  )
}

export function Overlay() {
  const state = useStore()
  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <a href="https://pmnd.rs/" style={{ position: 'absolute', bottom: 40, left: 40, fontSize: '13px' }}>
          PMND.RS
          <br />
          DEV COLLECTIVE
        </a>
        <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: '13px' }}>02/02/2023</div>
      </div>
      <Logo style={{ position: 'absolute', top: 40, left: 40, width: 30 }} />
      <div className="info">
        <h1>36</h1>
        <List open={state.open}>
          <h3>NIKE AIR</h3>
          <h3>“ZOOM”</h3>
          <h3>
            <span className="accent">PEGASUS</span>
          </h3>
          <h4>Running Shoes</h4>
          <p className="price">$98.97</p>
          <p>
            Year after year Pegasus has proven itself on the feet of runners everywhere. Now our most trusted style returns with new
            innovations that make it more itself than ever. Meet the reliable, comfortable, always ready-to-run Nike Air Zoom Pegasus.
          </p>
        </List>
      </div>
    </>
  )
}

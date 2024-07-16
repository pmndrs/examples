import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useIntersect, Image, ScrollControls, Scroll } from '@react-three/drei'

import img1 from './1.jpg'
import img2 from './2.jpg'
import img3 from './3.jpg'
import img4 from './4.jpg'
import img5 from './5.jpg'
import img6 from './6.jpg'
import img7 from './7.jpg'
import img8 from './8.jpg'
import img9 from './9.jpg'
import img10 from './10.jpg'
import img11 from './11.jpg'
import img12 from './12.jpg'

function Item({ url, scale, ...props }) {
  const visible = useRef(false)
  const [hovered, hover] = useState(false)
  const ref = useIntersect((isVisible) => (visible.current = isVisible))
  const { height } = useThree((state) => state.viewport)
  useFrame((state, delta) => {
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, visible.current ? 0 : -height / 2 + 1, 4, delta)
    ref.current.material.zoom = THREE.MathUtils.damp(ref.current.material.zoom, visible.current ? 1 : 1.5, 4, delta)
    ref.current.material.grayscale = THREE.MathUtils.damp(ref.current.material.grayscale, hovered ? 1 : 0, 4, delta)
  })
  return (
    <group {...props}>
      <Image ref={ref} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)} scale={scale} url={url} />
    </group>
  )
}

function Items() {
  const { width: w, height: h } = useThree((state) => state.viewport)
  return (
    <Scroll>
      <Item url={img1} scale={[w / 3, w / 3, 1]} position={[-w / 6, 0, 0]} />
      <Item url={img2} scale={[2, w / 3, 1]} position={[w / 30, -h, 0]} />
      <Item url={img3} scale={[w / 3, w / 5, 1]} position={[-w / 4, -h * 1, 0]} />
      <Item url={img4} scale={[w / 5, w / 5, 1]} position={[w / 4, -h * 1.2, 0]} />
      <Item url={img5} scale={[w / 5, w / 5, 1]} position={[w / 10, -h * 1.75, 0]} />
      <Item url={img6} scale={[w / 3, w / 3, 1]} position={[-w / 4, -h * 2, 0]} />
      <Item url={img7} scale={[w / 3, w / 5, 1]} position={[-w / 4, -h * 2.6, 0]} />
      <Item url={img8} scale={[w / 2, w / 2, 1]} position={[w / 4, -h * 3.1, 0]} />
      <Item url={img12} scale={[w / 2.5, w / 2, 1]} position={[-w / 6, -h * 4.1, 0]} />
    </Scroll>
  )
}

export const App = () => (
  <Canvas orthographic camera={{ zoom: 80 }} gl={{ alpha: false, antialias: false, stencil: false, depth: false }} dpr={[1, 1.5]}>
    <color attach="background" args={['#f0f0f0']} />
    <ScrollControls damping={6} pages={5}>
      <Items />
      <Scroll html style={{ width: '100%' }}>
        <h1 style={{ position: 'absolute', top: `100vh`, right: '20vw', fontSize: '25em', transform: `translate3d(0,-100%,0)` }}>all</h1>
        <h1 style={{ position: 'absolute', top: '180vh', left: '10vw' }}>hail</h1>
        <h1 style={{ position: 'absolute', top: '260vh', right: '10vw' }}>thee,</h1>
        <h1 style={{ position: 'absolute', top: '350vh', left: '10vw' }}>thoth</h1>
        <h1 style={{ position: 'absolute', top: '450vh', right: '10vw' }}>
          her
          <br />
          mes.
        </h1>
      </Scroll>
    </ScrollControls>
  </Canvas>
)

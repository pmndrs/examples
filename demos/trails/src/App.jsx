import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, Edges, Trail } from '@react-three/drei'
import { Physics, useCompoundBody } from '@react-three/cannon'
import { LayerMaterial, Depth, Fresnel } from 'lamina'
import { FontLoader, TextGeometry } from 'three-stdlib'

import boldFont from 'three/examples/fonts/helvetiker_bold.typeface.json'
import pmndrsModel from './pmndrs.glb?url'
import cursorModel from './cursor.glb?url'

// One centered, extruded "9.7.0" shared by every block in the scene
const font = new FontLoader().parse(boldFont)
const text = new TextGeometry('9.7.0', { font, size: 0.7, height: 0.35, curveSegments: 16, letterSpacing: 0.02 })
text.center()

const vec = new THREE.Vector3()
const dir = new THREE.Vector3()
// The swarm gathers slightly behind the hero so it frames it instead of covering it
const attractor = new THREE.Vector3(0, 0, -1)
// Live registry of swarm bodies so the cursor can blast them apart on click
const blocks = new Set()
// Set by <Bursts>; the cursor calls it on click to spawn logo shrapnel at its position
let burst = () => {}
const white = new THREE.MeshBasicMaterial({ color: '#fefefe', toneMapped: false })
const pink = new THREE.MeshBasicMaterial({ color: '#ff0080', toneMapped: false })
// Accent blocks cycle through the cursor-gradient palette
const accents = ['#ff0080', '#f7b955', '#5786f5'].map((color) => new THREE.MeshBasicMaterial({ color, toneMapped: false }))

export const App = ({ amount = 11 }) => (
  <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
    <Physics gravity={[0, 1, 0]}>
      <Hero />
      {Array.from({ length: amount }, (_, i) => (
        <Version
          key={i}
          material={i % 4 === 1 ? accents[Math.floor(i / 4) % accents.length] : white}
          scale={0.5 + (i % 3) * 0.25}
          angularDamping={0.4}
          linearDamping={0.8}
          position={[(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2 - 1]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
        />
      ))}
      <Cursor mass={15} angularDamping={0.5} linearDamping={0.5} position={[0, 0, 10]} />
    </Physics>
    <Bursts />
  </Canvas>
)

function Bursts() {
  const { nodes } = useGLTF(pmndrsModel)
  // The glb logo pivot is off-center; recenter a clone so shrapnel spins around itself
  const logo = useMemo(() => {
    const geometry = nodes.logo.geometry.clone()
    geometry.center()
    return geometry
  }, [nodes])
  const [bursts, setBursts] = useState([])
  const id = useRef(0)
  useEffect(() => {
    burst = (origin) => setBursts((all) => [...all, { id: ++id.current, origin }])
    return () => (burst = () => {})
  }, [])
  return bursts.map(({ id, origin }) => (
    <Burst key={id} geometry={logo} origin={origin} onDone={() => setBursts((all) => all.filter((b) => b.id !== id))} />
  ))
}

// Purely visual logo shrapnel: flies outward, tumbles, shrinks away — no physics cost
function Burst({ geometry, origin, onDone, count = 16, life = 1.5 }) {
  const group = useRef()
  const age = useRef(0)
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        // random sphere, biased towards the camera so debris whooshes past the viewer
        dir: new THREE.Vector3().randomDirection().add(vec.set(0, 0, 0.5)).normalize(),
        speed: 5 + Math.random() * 7,
        rotation: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
        spin: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12],
        size: 0.4 + Math.random() * 0.8,
        material: Math.random() < 0.45 ? accents[i % accents.length] : white
      })),
    [count]
  )
  useFrame((_, delta) => {
    age.current += delta
    const k = age.current / life
    if (k >= 1) return onDone()
    // pop in fast, decelerate, shrink to nothing
    const envelope = Math.min(k * 10, 1) * (1 - k)
    group.current.children.forEach((child, i) => {
      const p = particles[i]
      child.position.addScaledVector(p.dir, p.speed * (1 - 0.7 * k) * delta)
      child.rotation.x += p.spin[0] * delta
      child.rotation.y += p.spin[1] * delta
      child.rotation.z += p.spin[2] * delta
      child.scale.set(0.188, 0.188, 0.97).multiplyScalar(p.size * envelope)
    })
  })
  return (
    <group ref={group} position={origin}>
      {particles.map((p, i) => (
        <mesh key={i} geometry={geometry} material={p.material} rotation={p.rotation} scale={0.001}>
          <Edges threshold={20} color="black" lineWidth={1} />
        </mesh>
      ))}
    </group>
  )
}

function Block({ scale = 1, material = white, edge = 'black', ...props }) {
  return (
    <group {...props}>
      <mesh scale={scale} geometry={text} material={material}>
        <Edges scale={1.002} threshold={20} color={edge} lineWidth={1.5} />
      </mesh>
    </group>
  )
}

// One box approximating the extruded "9.7.0" word, baked to the visual scale
const wordBox = (scale) => [{ type: 'Box', args: [2.2 * scale, 0.55 * scale, 0.35 * scale], position: [0, 0, 0] }]

// Immovable billboard version number the swarm and cursor bounce off
function Hero({ scale = 1.2 }) {
  const [ref] = useCompoundBody(() => ({ mass: 0, position: [0, 0, 1.5], shapes: wordBox(scale) }))
  return <Block ref={ref} scale={scale} material={pink} />
}

function Version({ scale = 1, material = white, ...props }) {
  const [ref, api] = useCompoundBody(() => ({ mass: 4 * scale, ...props, shapes: wordBox(scale) }))
  useEffect(() => {
    const entry = { ref, api, scale }
    blocks.add(entry)
    return () => blocks.delete(entry)
  }, [ref, api, scale])
  // Pull every block back towards the gather point behind the hero
  useFrame(() => api.applyForce(vec.setFromMatrixPosition(ref.current.matrix).sub(attractor).normalize().multiplyScalar(-40 * scale).toArray(), [0, 0, 0]))
  return <Block ref={ref} scale={scale} material={material} />
}

function Cursor({ speed = 10, gradient = 0.7, ...props }) {
  const { nodes } = useGLTF(cursorModel)
  const viewport = useThree((state) => state.viewport)
  // <Trail> follows this object3d, parented to the cursor body so the ribbon trails its tip
  const trail = useRef()
  const [ref, api] = useCompoundBody(() => ({
    ...props,
    shapes: [
      { type: 'Cylinder', args: [0.6, 0.6, 0.5, 3], position: [0, 0.2, 0], rotation: [Math.PI / 2, Math.PI, 0] },
      { type: 'Box', args: [0.25, 1, 0.3], position: [0, -0.45, 0] }
    ]
  }))
  useFrame((state) => {
    vec.setFromMatrixPosition(ref.current.matrix)
    // Chase the pointer, diving to the swarm's gather depth so it plows through the clump
    api.velocity.set(((state.mouse.x * viewport.width) / 2 - vec.x) * speed, ((state.mouse.y * viewport.height) / 2 - vec.y) * speed, (attractor.z - vec.z) * 2)
  })
  useEffect(() => {
    // Click detonates: every block gets a distance-falloff impulse away from the cursor,
    // applied slightly off-center so they tumble. The attractor then reels them back in.
    const explode = () => {
      vec.setFromMatrixPosition(ref.current.matrix)
      burst(vec.toArray())
      for (const block of blocks) {
        dir.setFromMatrixPosition(block.ref.current.matrix).sub(vec)
        const falloff = Math.max(dir.length(), 1)
        dir.normalize().multiplyScalar((42 * block.scale) / falloff)
        block.api.applyImpulse(dir.toArray(), [(Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4])
      }
    }
    window.addEventListener('pointerdown', explode)
    return () => window.removeEventListener('pointerdown', explode)
  }, [])
  return (
    <>
      <Trail color="red" target={trail} length={4} width={0.5} attenuation={(w) => w * 2} />
      <group ref={ref}>
        <object3D position-y={0.9} ref={trail} />
        <mesh scale={[0.5, 1, 0.55]} rotation={[0, Math.PI / 2, 0]} geometry={nodes.Cube.geometry}>
          <LayerMaterial toneMapped={false}>
            <Depth colorA="#ff0080" colorB="black" alpha={1} mode="normal" near={0.5 * gradient} far={0.5} origin={[0, 0, 0]} />
            <Depth colorA="blue" colorB="#f7b955" alpha={1} mode="add" near={2 * gradient} far={2} origin={[1, 1, 1]} />
            <Depth colorA="green" colorB="#f7b955" alpha={1} mode="add" near={3 * gradient} far={3} origin={[-1, -1, -1]} />
            <Depth colorA="white" colorB="red" alpha={1} mode="overlay" near={1.5 * gradient} far={1.5} origin={[1, -1, -1]} />
            <Fresnel mode="add" color="white" intensity={0.75} power={2} bias={0.05} />
          </LayerMaterial>
          <Edges scale={1.003} color="white" />
        </mesh>
      </group>
    </>
  )
}

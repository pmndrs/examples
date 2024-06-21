import { Suspense, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, TransformControls, ContactShadows, useGLTF, useCursor } from '@react-three/drei'
import { proxy, useSnapshot } from 'valtio'

// Reactive state model, using Valtio ...
const modes = ['translate', 'rotate', 'scale']
const state = proxy({ current: null, mode: 0 })

function Model({ name, ...props }) {
  // Ties this component to the state model
  const snap = useSnapshot(state)
  // Fetching the GLTF, nodes is a collection of all the meshes
  // It's cached/memoized, it only gets loaded and parsed once
  const { nodes } = useGLTF('/compressed.glb')
  // Feed hover state into useCursor, which sets document.body.style.cursor to pointer|auto
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  return (
    <mesh
      // Click sets the mesh as the new target
      onClick={(e) => (e.stopPropagation(), (state.current = name))}
      // If a click happened but this mesh wasn't hit we null out the target,
      // This works because missed pointers fire before the actual hits
      onPointerMissed={(e) => e.type === 'click' && (state.current = null)}
      // Right click cycles through the transform modes
      onContextMenu={(e) => snap.current === name && (e.stopPropagation(), (state.mode = (snap.mode + 1) % modes.length))}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={(e) => setHovered(false)}
      name={name}
      geometry={nodes[name].geometry}
      material={nodes[name].material}
      material-color={snap.current === name ? '#ff6080' : 'white'}
      {...props}
      dispose={null}
    />
  )
}

function Controls() {
  // Get notified on changes to state
  const snap = useSnapshot(state)
  const scene = useThree((state) => state.scene)
  return (
    <>
      {/* As of drei@7.13 transform-controls can refer to the target by children, or the object prop */}
      {snap.current && <TransformControls object={scene.getObjectByName(snap.current)} mode={modes[snap.mode]} />}
      {/* makeDefault makes the controls known to r3f, now transform-controls can auto-disable them when active */}
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
    </>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, -10, 80], fov: 50 }} dpr={[1, 2]}>
      <pointLight position={[100, 100, 100]} intensity={0.8} />
      <hemisphereLight color="#ffffff" groundColor="#b9b9b9" position={[-7, 25, 13]} intensity={0.85} />
      <Suspense fallback={null}>
        <group position={[0, 10, 0]}>
          <Model name="Curly" position={[1, -11, -20]} rotation={[2, 0, -0]} />
          <Model name="DNA" position={[20, 0, -17]} rotation={[1, 1, -2]} />
          <Model name="Headphones" position={[20, 2, 4]} rotation={[1, 0, -1]} />
          <Model name="Notebook" position={[-21, -15, -13]} rotation={[2, 0, 1]} />
          <Model name="Rocket003" position={[18, 15, -25]} rotation={[1, 1, 0]} />
          <Model name="Roundcube001" position={[-25, -4, 5]} rotation={[1, 0, 0]} scale={0.5} />
          <Model name="Table" position={[1, -4, -28]} rotation={[1, 0, -1]} scale={0.5} />
          <Model name="VR_Headset" position={[7, -15, 28]} rotation={[1, 0, -1]} scale={5} />
          <Model name="Zeppelin" position={[-20, 10, 10]} rotation={[3, -1, 3]} scale={0.005} />
          <ContactShadows rotation-x={Math.PI / 2} position={[0, -35, 0]} opacity={0.25} width={200} height={200} blur={1} far={50} />
        </group>
      </Suspense>
      <Controls />
    </Canvas>
  )
}

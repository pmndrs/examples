import { Canvas } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import { Physics, usePlane } from '@react-three/cannon'
import { Cursor } from './helpers/Drag'
import { Guy } from './components/Guy'
import { Mug, Chair, Table, Lamp } from './components/Furniture'

export default function App() {
  return (
    <Canvas dpr={[1, 2]} shadows camera={{ position: [-40, 40, 40], fov: 25, near: 1, far: 100 }}>
      <color attach="background" args={['#171720']} />
      <fog attach="fog" args={['#171720', 60, 90]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[-20, -5, -20]} color="red" />
      <Physics allowSleep={false} iterations={15} gravity={[0, -200, 0]}>
        <Cursor />
        <Guy rotation={[-Math.PI / 3, 0, 0]} />
        <Floor position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        <Chair position={[0, 0, -2.52]} />
        <Table position={[8, 0, 0]} />
        <Mug position={[8, 3, 0]} />
        <Lamp position={[0, 15, 0]} />
      </Physics>
    </Canvas>
  )
}

function Floor(props) {
  const [ref] = usePlane(() => ({ type: 'Static', ...props }))
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        color="#878790"
        blur={[400, 400]}
        resolution={1024}
        mixBlur={1}
        mixStrength={3}
        depthScale={1}
        minDepthThreshold={0.85}
        metalness={0}
        roughness={1}
      />
    </mesh>
  )
}

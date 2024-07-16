import { Canvas, extend, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, Effects, useTexture } from '@react-three/drei'
import { LUTPass, LUTCubeLoader } from 'three-stdlib'

import cubicleTex from './cubicle-99.cube?url'
import terrazoImage from './terrazo.png'

extend({ LUTPass })

function Grading() {
  const { texture3D } = useLoader(LUTCubeLoader, cubicleTex)
  return (
    <Effects>
      <lUTPass lut={texture3D} intensity={0.75} />
    </Effects>
  )
}

function Sphere(props) {
  const texture = useTexture(terrazoImage)
  return (
    <mesh {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial map={texture} clearcoat={1} clearcoatRoughness={0} roughness={0} metalness={0.5} />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas frameloop="demand" camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight />
      <spotLight intensity={0.5} angle={0.2} penumbra={1} position={[5, 15, 10]} />
      <Sphere />
      <Grading />
      <Environment preset="dawn" background blur={0.6} />
      <OrbitControls />
    </Canvas>
  )
}

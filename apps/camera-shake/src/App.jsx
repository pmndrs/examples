import * as THREE from 'three'
import { Suspense, useRef, useState } from 'react'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, CameraShake, Environment } from '@react-three/drei'
import Model from './Model'

RectAreaLightUniformsLib.init()

function Light() {
  const ref = useRef()
  useFrame((_) => (ref.current.rotation.x = _.clock.elapsedTime))
  return (
    <group ref={ref}>
      <rectAreaLight width={15} height={100} position={[30, 30, -10]} intensity={5} onUpdate={(self) => self.lookAt(0, 0, 0)} />
    </group>
  )
}

function Rig() {
  const [vec] = useState(() => new THREE.Vector3())
  const { camera, mouse } = useThree()
  useFrame(() => camera.position.lerp(vec.set(mouse.x * 2, 1, 60), 0.05))
  return <CameraShake maxYaw={0.01} maxPitch={0.01} maxRoll={0.01} yawFrequency={0.5} pitchFrequency={0.5} rollFrequency={0.4} />
}

export default function App() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 160, 160], fov: 20 }}>
      <fog attach="fog" args={['lightpink', 60, 100]} />
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <Model position={[-4.5, -4, 0]} rotation={[0, -2.8, 0]} />
        <spotLight position={[50, 50, -30]} castShadow />
        <pointLight position={[-10, -10, -10]} color="red" intensity={3} />
        <pointLight position={[0, -5, 5]} intensity={0.5} />
        <directionalLight position={[0, -5, 0]} color="red" intensity={2} />
        <Light />
        <Environment preset="warehouse" />
        <Rig />
      </Suspense>
      <OrbitControls makeDefault />
    </Canvas>
  )
}

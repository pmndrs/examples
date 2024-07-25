import * as THREE from 'three'
import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Sky, Environment, Clouds, Cloud } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { useControls } from 'leva'

import ballTripModel from './ball-trip.optimized.glb?url'

export default function App() {
  const { debug } = useControls({ debug: false })
  return (
    <Canvas shadows camera={{ position: [-50, -25, 150], fov: 15 }}>
      <Suspense fallback={null}>
        <hemisphereLight intensity={0.45 * Math.PI} />
        <spotLight decay={0} angle={0.4} penumbra={1} position={[20, 30, 2.5]} castShadow shadow-bias={-0.00001} />
        <directionalLight decay={0} color="red" position={[-10, -10, 0]} intensity={1.5} />
        <Clouds material={THREE.MeshBasicMaterial}>
          <Cloud seed={10} bounds={50} volume={80} position={[40, 0, -80]} />
          <Cloud seed={10} bounds={50} volume={80} position={[-40, 10, -80]} />
        </Clouds>
        <Environment preset="city" />
        <Sky />
        <Physics debug={debug} colliders={false}>
          <group position={[2, 3, 0]}>
            <Track position={[-3, 0, 10.5]} rotation={[0, -0.4, 0]} />
            <Sphere position={[-12, 13, 0]} />
            <Sphere position={[-9, 13, 0]} />
            <Sphere position={[-6, 13, 0]} />
            <Pacman />
          </group>
        </Physics>
        <OrbitControls />
      </Suspense>
    </Canvas>
  )
}

function Track(props) {
  const { nodes } = useGLTF(ballTripModel)
  return (
    <RigidBody colliders="trimesh" type="fixed">
      <mesh geometry={nodes.Cylinder.geometry} {...props} dispose={null}>
        <meshPhysicalMaterial color="lightblue" transmission={1} thickness={1} roughness={0} />
      </mesh>
      <Cylinder position={[-0.85, 4, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Cylinder position={[1.5, 1.75, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Cylinder position={[1.15, 1, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Cylinder position={[2, 3, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Cylinder position={[1.25, 5, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Cylinder position={[-1, 7, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Cylinder position={[-1.5, 5, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Cylinder position={[1.75, 8, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Box position={[-3, 11, 0]} rotation={[0, 0, -0.5]} />
      <Box position={[-8.6, 12.3, 0]} length={8} rotation={[0, 0, -0.1]} />
    </RigidBody>
  )
}

function Pacman() {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    ref.current?.setNextKinematicTranslation({ x: -5, y: -8 + Math.sin(t * 10) / 2, z: 0 })
  })
  return (
    <group>
      <RigidBody ref={ref} type="kinematicPosition" colliders="trimesh">
        <mesh castShadow receiveShadow rotation={[-Math.PI / 2, Math.PI, 0]}>
          <sphereGeometry args={[10, 16, 16, 0, Math.PI * 1.3]} />
          <meshStandardMaterial color="#ffc060" side={THREE.DoubleSide} />
        </mesh>
        <mesh castShadow position={[-5, 0, 8.5]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="black" roughness={0.75} />
        </mesh>
      </RigidBody>
    </group>
  )
}

const Box = ({ length = 4, ...props }) => (
  <mesh castShadow receiveShadow {...props}>
    <boxGeometry args={[length, 0.4, 4]} />
    <meshStandardMaterial color="white" />
  </mesh>
)

const Sphere = (props) => (
  <RigidBody colliders="ball" restitution={0.7}>
    <mesh castShadow receiveShadow {...props}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="white" />
    </mesh>
  </RigidBody>
)

const Cylinder = (props) => (
  <mesh castShadow receiveShadow {...props}>
    <cylinderGeometry args={[0.25, 0.25, 4]} />
    <meshStandardMaterial />
  </mesh>
)

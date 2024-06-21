import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier'

const euler = new THREE.Euler()
const quaternion = new THREE.Quaternion()
const RESTITUTION = 2.2

export default function App(props) {
  return (
    <group {...props}>
      <ambientLight intensity={0.3} onPointerOver={() => null} />
      <pointLight position={[10, 10, 5]} />
      <pointLight position={[-10, -10, -5]} />
      <Physics gravity={[0, -30, 0]}>
        <Ball />
        <Paddle />
        <Enemy color="orange" position={[2.75, 1, 0]} />
        <Enemy color="skyblue" position={[-2.75, 3, 0]} />
      </Physics>
    </group>
  )
}

function Ball({ args = [0.75, 32, 32] }) {
  const { viewport } = useThree()
  const ref = useRef()
  return (
    <>
      <RigidBody ref={ref} colliders="ball" mass={1}>
        <mesh>
          <sphereGeometry args={args} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>
      {/* Invisible cuboid, if hit it respawns the ball */}
      <RigidBody
        colliders={false}
        position={[0, -viewport.height, 0]}
        restitution={RESTITUTION}
        type="fixed"
        onCollisionEnter={() => {
          ref.current.setTranslation({ x: 0, y: 0, z: 0 })
          ref.current.setLinvel({ x: 0, y: 10, z: 0 })
        }}>
        <CuboidCollider args={[100, 2, 100]} />
      </RigidBody>
    </>
  )
}

function Paddle({ args = [4, 1, 1] }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.setTranslation({ x: (state.mouse.x * state.viewport.width) / 2, y: -3.5, z: 0 })
    ref.current.setRotation(quaternion.setFromEuler(euler.set(0, 0, (state.mouse.x * Math.PI) / 5)))
  })
  return (
    <RigidBody ref={ref} colliders="cuboid" type="fixed" restitution={RESTITUTION}>
      <mesh>
        <boxGeometry args={args} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </RigidBody>
  )
}

function Enemy({ args = [2.5, 1, 1], position, color }) {
  const ref = useRef()
  return (
    <RigidBody ref={ref} colliders="cuboid" type="fixed" position={position} restitution={RESTITUTION}>
      <mesh>
        <boxGeometry args={args} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

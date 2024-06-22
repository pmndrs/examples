import * as THREE from "three"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { PerspectiveCamera, RoundedBox, Environment, useTexture, useAspect } from "@react-three/drei"
import { Physics, useSphere, useBox, usePlane } from "@react-three/cannon"

function BallAndCollisions({ args = [1.2, 32, 32], v = new THREE.Vector3() }) {
  const cam = useRef()
  const [ref, api] = useSphere(() => ({ args: 1.2, mass: 1, material: { restitution: 0.95 } }))
  usePlane(() => ({ position: [0, -15, 0], rotation: [-Math.PI / 2, 0, 0], onCollide: () => (api.position.set(0, 0, 0), api.velocity.set(0, 0, 0)) }))
  usePlane(() => ({ position: [-15, 0, 0], rotation: [-Math.PI / 2, Math.PI / 2, 0] }))
  usePlane(() => ({ position: [15, 0, 0], rotation: [Math.PI / 2, -Math.PI / 2, 0] }))
  useEffect(
    () => api.position.subscribe((p) => (cam.current.position.lerp(v.set(p[0], p[1], 18 + Math.max(0, p[1]) / 2), 0.05), cam.current.lookAt(0, 0, 0))),
    [],
  )
  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault position={[0, 0, 12]} fov={50} />
      <mesh ref={ref}>
        <sphereGeometry args={args} />
        <meshPhysicalMaterial map={useTexture("/cross.jpg")} transmission={1} roughness={0} thickness={10} envMapIntensity={1} />
      </mesh>
    </>
  )
}

const Block = forwardRef(({ shake = 0, args = [1, 1.5, 4], vec = new THREE.Vector3(), ...props }, ref) => {
  const group = useRef()
  const [block, api] = useBox(() => ({ args, ...props, onCollide: (e) => (shake += e.contact.impactVelocity / 12.5) }))
  useFrame(() => group.current.position.lerp(vec.set(0, (shake = THREE.MathUtils.lerp(shake, 0, 0.1)), 0), 0.2))
  useImperativeHandle(ref, () => api, [api])
  return (
    <group ref={group}>
      <RoundedBox ref={block} args={args} radius={0.4} smoothness={10}>
        <meshPhysicalMaterial transmission={1} roughness={0} thickness={3} envMapIntensity={4} />
      </RoundedBox>
    </group>
  )
})

function Paddle({ args = [5, 1.5, 4] }) {
  const api = useRef()
  useFrame((state) => (api.current.position.set(state.mouse.x * 10, -5, 0), api.current.rotation.set(0, 0, (state.mouse.x * Math.PI) / 4)))
  return <Block ref={api} args={args} material={{ restitution: 1.3 }} />
}

function MovingBlock({ offset = 0, position: [x, y, z], ...props }) {
  const api = useRef()
  useFrame((state) => api.current.position.set(x + (Math.sin(offset + state.clock.elapsedTime) * state.viewport.width) / 4, y, z))
  return <Block ref={api} args={[3, 1.5, 4]} material={{ restitution: 1.1 }} {...props} />
}

const Background = (props) => (
  <mesh scale={useAspect(5000, 3800, 3)} {...props}>
    <planeGeometry />
    <meshBasicMaterial map={useTexture("/bg.jpg")} />
  </mesh>
)

export const App = () => (
  <Canvas dpr={1.5} camera={{ position: [0, 2, 12], fov: 50 }}>
    <Physics iterations={5} gravity={[0, -30, 0]}>
      <BallAndCollisions />
      <Paddle />
      {Array.from({ length: 6 }, (_, i) => <MovingBlock key={i} position={[0, 1 + i * 4.5, 0]} offset={10000 * i} />) /* prettier-ignore */}
      <Block args={[10, 1.5, 4]} position={[-11, -7, 0]} rotation={[0, 0, -0.7]} material={{ restitution: 1.2 }} />
      <Block args={[10, 1.5, 4]} position={[11, -7, 0]} rotation={[0, 0, 0.7]} material={{ restitution: 1.2 }} />
      <Environment preset="warehouse" />
      <Background position={[0, 0, -5]} />
    </Physics>
  </Canvas>
)

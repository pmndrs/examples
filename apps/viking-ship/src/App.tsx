import * as THREE from "three"
import React, { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Loader } from "@react-three/drei"
import Model from "./Model"

function Rig({ children }) {
  const outer = useRef<THREE.Group>(null!)
  const inner = useRef<THREE.Group>(null!)
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime()
    outer.current.position.y = THREE.MathUtils.lerp(outer.current.position.y, 0, 0.05)
    inner.current.rotation.y = Math.sin(t / 8) * Math.PI
    inner.current.position.z = 5 + -Math.sin(t / 2) * 10
    inner.current.position.y = -5 + Math.sin(t / 2) * 2
  })
  return (
    <group position={[0, -100, 0]} ref={outer}>
      <group ref={inner}>{children}</group>
    </group>
  )
}

export default function App() {
  return (
    <>
      <Canvas linear camera={{ position: [0, 15, 30], fov: 70 }}>
        <color attach="background" args={[0xfff0ea]} />
        <fog attach="fog" args={[0xfff0ea, 10, 60]} />
        <ambientLight intensity={4} />
        <Suspense fallback={null}>
          <Rig>
            <Model />
          </Rig>
        </Suspense>
        <Environment preset="sunset" />
        <OrbitControls />
      </Canvas>
      <Loader />
    </>
  )
}

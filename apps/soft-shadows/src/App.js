import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { SoftShadows } from "@react-three/drei"
import { useControls } from "leva"
import { Perf } from "r3f-perf"

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
function Sphere({ position = [0, 0, 0], ...props }) {
  const ref = useRef()
  const factor = useMemo(() => 0.5 + Math.random(), [])
  useFrame((state) => {
    const t = easeInOutCubic((1 + Math.sin(state.clock.getElapsedTime() * factor)) / 2)
    ref.current.position.y = position[1] + t * 4
    ref.current.scale.y = 1 + t * 3
  })
  return (
    <mesh ref={ref} position={position} {...props} castShadow receiveShadow>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshLambertMaterial color="white" roughness={0} metalness={0.1} />
    </mesh>
  )
}

function Spheres({ number = 20 }) {
  const ref = useRef()
  const positions = useMemo(() => [...new Array(number)].map(() => [3 - Math.random() * 6, Math.random() * 4, 3 - Math.random() * 6]), [])
  useFrame((state) => (ref.current.rotation.y = Math.sin(state.clock.getElapsedTime() / 2) * Math.PI))
  return (
    <group ref={ref}>
      {positions.map((pos, index) => (
        <Sphere key={index} position={pos} />
      ))}
    </group>
  )
}

export default function App() {
  const { enabled, ...config } = useControls({
    enabled: true,
    size: { value: 25, min: 0, max: 100 },
    focus: { value: 0, min: 0, max: 2 },
    samples: { value: 10, min: 1, max: 20, step: 1 }
  })
  return (
    <Canvas shadows camera={{ position: [-5, 2, 10], fov: 60 }}>
      {enabled && <SoftShadows {...config} />}
      <fog attach="fog" args={["white", 0, 40]} />
      <ambientLight intensity={0.5} />
      <directionalLight castShadow position={[2.5, 8, 5]} intensity={1.5} shadow-mapSize={1024}>
        <orthographicCamera attach="shadow-camera" args={[-10, 10, -10, 10, 0.1, 50]} />
      </directionalLight>
      <pointLight position={[-10, 0, -20]} color="white" intensity={1} />
      <pointLight position={[0, -10, 0]} intensity={1} />
      <group position={[0, -3.5, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[4, 1, 1]} />
          <meshLambertMaterial />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <shadowMaterial transparent opacity={0.4} />
        </mesh>
        <Spheres />
      </group>
      {/*<Perf position="top-left" />*/}
    </Canvas>
  )
}

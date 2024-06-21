import { Canvas } from '@react-three/fiber'
import { useGLTF, PresentationControls, Environment, ContactShadows, Html } from '@react-three/drei'

export default function App() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 10], fov: 25 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
      <PresentationControls
        global
        config={{ mass: 2, tension: 500 }}
        snap={{ mass: 4, tension: 1500 }}
        rotation={[0, 0.3, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 2]}>
        <Watch rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.25, 0]} scale={0.003} />
      </PresentationControls>
      <ContactShadows position={[0, -1.4, 0]} opacity={0.75} scale={10} blur={3} far={4} />
      <Environment preset="city" />
    </Canvas>
  )
}

function Watch(props) {
  const { nodes, materials } = useGLTF('/watch-v1.glb')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Object005_glass_0.geometry} material={materials.glass}>
        <Html scale={100} rotation={[Math.PI / 2, 0, 0]} position={[180, -350, 50]} transform occlude>
          <div className="annotation">
            6.550 $ <span style={{ fontSize: '1.5em' }}>🥲</span>
          </div>
        </Html>
      </mesh>
      <mesh castShadow receiveShadow geometry={nodes.Object006_watch_0.geometry} material={materials.watch} />
    </group>
  )
}

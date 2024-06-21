import { Canvas } from '@react-three/fiber'
import { useGLTF, useTexture, Decal, Environment, OrbitControls, RandomizedLight, AccumulativeShadows } from '@react-three/drei'

export const App = () => (
  <Canvas shadows camera={{ position: [2, 2, 10], fov: 20 }}>
    <ambientLight intensity={1} />
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
    <group position={[0.25, -1, 0]}>
      <Bun />
      <AccumulativeShadows temporal frames={100} scale={12} alphaTest={0.85} position={[0, 0.04, 0]}>
        <RandomizedLight amount={8} radius={10} ambient={0.5} position={[2.5, 5, -5]} bias={0.001} />
      </AccumulativeShadows>
    </group>
    <Environment preset="city" background blur={0.7} />
    <OrbitControls makeDefault />
  </Canvas>
)

function Bun(props) {
  const { nodes } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bunny/model.gltf')
  return (
    <mesh castShadow receiveShadow geometry={nodes.bunny.geometry} {...props} dispose={null}>
      <meshStandardMaterial color="black" />
      <Sticker url="/Sticjer_1024x1024@2x.png" position={[-0.1, 1.3, 0.55]} rotation={Math.PI * 1.2} scale={0.45} />
      <Sticker url="/Twemoji_1f600.svg.png" position={[0.4, 1, 0.55]} rotation={Math.PI * 0.9} scale={0.3} />
      <Sticker url="/D64aIWkXoAAFI08.png" position={[0, 0.7, 0.85]} rotation={Math.PI * 1.2} scale={0.35} />
      <Sticker url="/three.png" position={[-0.54, 1.1, 0.57]} rotation={-1.2} scale={0.2} />
    </mesh>
  )
}

function Sticker({ url, ...props }) {
  const emoji = useTexture(url)
  return (
    <Decal /*debug*/ {...props}>
      <meshPhysicalMaterial
        transparent
        polygonOffset
        polygonOffsetFactor={-10}
        map={emoji}
        map-flipY={false}
        map-anisotropy={16}
        iridescence={1}
        iridescenceIOR={1}
        iridescenceThicknessRange={[0, 1400]}
        roughness={1}
        clearcoat={0.5}
        metalness={0.75}
        toneMapped={false}
      />
    </Decal>
  )
}

import { Canvas } from '@react-three/fiber'
import { AccumulativeShadows, RandomizedLight, OrbitControls, Environment, useGLTF, useVideoTexture } from '@react-three/drei'
import { EffectComposer, Bloom, HueSaturation, BrightnessContrast, TiltShift2, WaterEffect, ToneMapping } from '@react-three/postprocessing'

export default function App() {
  return (
    <Canvas gl={{ antialias: false }} flat shadows camera={{ position: [0, 0, 8], fov: 35 }}>
      <color attach="background" args={['#353535']} />
      <fog attach="fog" args={['#353535', 5, 20]} />
      <ambientLight intensity={2} />
      <Suzi rotation={[-0.63, 0, 0]} scale={2} position={[0, -1.175, 0]} />
      <Cookie distance={100} intensity={15} angle={0.6} penumbra={1} position={[2, 5, 0]} />
      <AccumulativeShadows receiveShadow temporal frames={100} opacity={0.8} alphaTest={0.9} scale={12} position={[0, -0.5, 0]}>
        <RandomizedLight radius={4} ambient={0.5} position={[5, 8, -10]} bias={0.001} />
      </AccumulativeShadows>
      <mesh castShadow position={[-1.5, -0.245, 1]}>
        <sphereGeometry args={[0.25, 64, 64]} />
        <meshStandardMaterial color="#353535" />
      </mesh>
      <mesh castShadow position={[1.5, -0.24, 1]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#353535" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} scale={100}>
        <planeGeometry />
        <meshLambertMaterial color="#353535" />
      </mesh>
      <Environment preset="city" />
      <OrbitControls autoRotate autoRotateSpeed={0.1} enableZoom={false} minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
      <Postpro />
    </Canvas>
  )
}

function Postpro() {
  return (
    <EffectComposer disableNormalPass>
      <HueSaturation saturation={-1} />
      <BrightnessContrast brightness={0} contrast={0.25} />
      <WaterEffect factor={0.75} />
      <TiltShift2 samples={6} blur={0.5} />
      <Bloom mipmapBlur luminanceThreshold={0} intensity={30} />
      <ToneMapping />
    </EffectComposer>
  )
}

function Cookie(props) {
  const texture = useVideoTexture('/caustics.mp4')
  return <spotLight decay={0} map={texture} castShadow {...props} />
}

function Suzi(props) {
  const { nodes } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/suzanne-high-poly/model.gltf')
  return (
    <mesh castShadow receiveShadow geometry={nodes.Suzanne.geometry} {...props} dispose={null}>
      <meshStandardMaterial color="#353535" />
    </mesh>
  )
}

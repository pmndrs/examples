import { Canvas } from '@react-three/fiber'
import { OrbitControls, Bounds, BakeShadows } from '@react-three/drei'
import { Room } from './Room'

export default function App() {
  return (
    <Canvas orthographic shadows dpr={[1, 2]} camera={{ position: [10, 10, 10], zoom: 10 }}>
      <color attach="background" args={['#252530']} />
      <ambientLight intensity={0.01} />
      <hemisphereLight intensity={0.125} color="#8040df" groundColor="red" />
      <spotLight castShadow color="orange" intensity={2} position={[-50, 50, 40]} angle={0.25} penumbra={1} shadow-mapSize={[128, 128]} shadow-bias={0.00005} />

      <Bounds fit clip observe margin={1}>
        <Room scale={0.1} />
      </Bounds>
      <BakeShadows />

      <OrbitControls
        makeDefault
        minAzimuthAngle={0}
        maxAzimuthAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 3}
        enableZoom={true}
        enablePan={true}
        zoomSpeed={0.3}
      />
      <gridHelper args={[1000, 200, '#151515', '#020202']} position={[0, -4, 0]} />
      <mesh scale={200} rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]} receiveShadow>
        <planeGeometry />
        <shadowMaterial transparent opacity={0.3} />
      </mesh>
    </Canvas>
  )
}

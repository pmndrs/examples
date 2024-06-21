import { MathUtils } from 'three'
import { Canvas } from '@react-three/fiber'
import { useGLTF, AccumulativeShadows, RandomizedLight, OrbitControls, Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, DepthOfField, N8AO, ToneMapping } from '@react-three/postprocessing'
import { Geometry, Base, Addition, Brush } from '@react-three/csg'
import { Physics, RigidBody, CuboidCollider, InstancedRigidBodies } from '@react-three/rapier'

export const App = () => (
  <Canvas flat shadows gl={{ antialias: false }} camera={{ position: [-30, 35, -15], near: 30, far: 55, fov: 12 }}>
    {/* Lighting, environment and colors */}
    <color attach="background" args={['#f0f0f0']} />
    <ambientLight intensity={0.5} />
    <directionalLight position={[-10, 10, 5]} shadow-mapSize={[256, 256]} shadow-bias={-0.0001} castShadow>
      <orthographicCamera attach="shadow-camera" args={[-10, 10, -10, 10]} />
    </directionalLight>
    <Environment resolution={32}>
      <Lightformer position={[10, 10, 10]} scale={10} intensity={4} />
      <Lightformer position={[10, 0, -10]} scale={10} color="red" intensity={6} />
      <Lightformer position={[-10, -10, -10]} scale={10} intensity={4} />
    </Environment>
    {/* Moon physics */}
    <Physics gravity={[0, -4, 0]}>
      <Scene position={[1, 0, -1.5]} />
      <Hats />
      <RigidBody position={[0, -1, 0]} type="fixed" colliders="false">
        <CuboidCollider restitution={0.1} args={[1000, 1, 1000]} />
      </RigidBody>
    </Physics>
    {/* Soft shadows, they stop rendering after 1500 frames */}
    <AccumulativeShadows temporal frames={Infinity} alphaTest={1} blend={200} limit={1500} scale={25} position={[0, -0.05, 0]}>
      <RandomizedLight amount={1} mapSize={512} radius={5} ambient={0.5} position={[-10, 10, 5]} size={10} bias={0.001} />
    </AccumulativeShadows>
    {/* Effects */}
    <EffectComposer>
      <N8AO aoRadius={0.5} intensity={1} />
      <DepthOfField target={[0, 0, -2.5]} focusRange={0.1} bokehScale={10} />
      <ToneMapping />
    </EffectComposer>
    {/* Controls */}
    <OrbitControls autoRotate autoRotateSpeed={0.1} enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 4} />
  </Canvas>
)

function Scene(props) {
  const { nodes, materials } = useGLTF('/blender-threejs-journey-20k-transformed.glb')
  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh castShadow receiveShadow geometry={nodes.boxBase.geometry} material={materials.boxBase} />
        <mesh receiveShadow geometry={nodes.boxBack.geometry} material={materials.inside} />
        <mesh castShadow receiveShadow geometry={nodes.Text.geometry} material={materials.boxBase} />
      </RigidBody>
    </group>
  )
}

function Hats({ count = 80, rand = MathUtils.randFloatSpread }) {
  const { nodes, materials } = useGLTF('/blender-threejs-journey-20k-hat-transformed.glb')
  const instances = Array.from({ length: count }, (_, i) => ({
    key: i,
    position: [rand(2) + 1, 10 + i / 2, rand(2) - 2],
    rotation: [Math.random(), Math.random(), Math.random()]
  }))
  return (
    <InstancedRigidBodies instances={instances} colliders="hull">
      <instancedMesh receiveShadow castShadow args={[undefined, undefined, count]} dispose={null}>
        {/* Merging the hat into one clump bc instances need a single geometry to function */}
        <Geometry useGroups>
          <Base geometry={nodes.Plane006.geometry} material={materials.Material} />
          <Addition geometry={nodes.Plane006_1.geometry} material={materials.boxCap} />
        </Geometry>
      </instancedMesh>
    </InstancedRigidBodies>
  )
}

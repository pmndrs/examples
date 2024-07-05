import * as THREE from 'three'
import { Fragment, Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Environment, Loader } from '@react-three/drei'
import Bottles from './Bottles'

function Sphere(props) {
  return (
    <mesh castShadow {...props} renderOrder={-2000000}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color="white" roughness={1} />
    </mesh>
  )
}

function Zoom({ vec = new THREE.Vector3(0, 0, 100) }) {
  return useFrame((state) => {
    state.camera.position.lerp(vec.set(state.mouse.x * 10, 0, 100), 0.075)
    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 22, 0.075)
    state.camera.updateProjectionMatrix()
  })
}

function Spheres() {
  const group = useRef()
  useFrame((state) => {
    group.current.children[0].position.x = THREE.MathUtils.lerp(
      group.current.children[0].position.x,
      -18 - state.mouse.x * 3,
      0.02
    )
    group.current.children[1].position.x = THREE.MathUtils.lerp(
      group.current.children[1].position.x,
      -10 - state.mouse.x * 10,
      0.01
    )
    group.current.children[2].position.x = THREE.MathUtils.lerp(
      group.current.children[2].position.x,
      18 - state.mouse.x * 5,
      0.03
    )
    group.current.children[3].position.x = THREE.MathUtils.lerp(
      group.current.children[3].position.x,
      10 - state.mouse.x * 6,
      0.04
    )
  })
  return (
    <group ref={group}>
      <Sphere position={[-40, 1, 10]} />
      <Sphere position={[-20, 10, -20]} scale={10} />
      <Sphere position={[40, 3, -4]} scale={3} />
      <Sphere position={[30, 0.75, 10]} scale={0.75} />
    </group>
  )
}

export default function App() {
  return (
    <Fragment>
      <Canvas dpr={[1, 1.5]} shadows camera={{ position: [0, 0, 100], fov: 22 }}>
        <fog attach="fog" args={['#f0f0f0', 100, 150]} />
        <color attach="background" args={['#f0f0f0']} />
        <spotLight
          penumbra={1}
          angle={1}
          castShadow
          position={[10, 60, -5]}
          intensity={8}
          shadow-mapSize={[512, 512]}
        />
        <Suspense fallback={null}>
          <group position={[2.5, -12, 0]}>
            <Bottles />
            <Spheres />
            <mesh
              rotation-x={-Math.PI / 2}
              position={[0, 0.01, 0]}
              scale={[200, 200, 200]}
              receiveShadow
              renderOrder={100000}>
              <planeGeometry />
              <shadowMaterial transparent color="#251005" opacity={0.25} />
            </mesh>
          </group>
          <hemisphereLight intensity={0.2} />
          <ambientLight intensity={0.5} />
          <Environment preset="warehouse" />
          <Zoom />
          <Text
            position={[0, -2.5, -50]}
            letterSpacing={-0.05}
            font="/Ki-Medium.ttf"
            fontSize={30}
            color="white"
            material-toneMapped={false}
            material-fog={false}
            anchorX="center"
            anchorY="middle">
            {`Poimandres`}
          </Text>
        </Suspense>
      </Canvas>
      <Loader />
    </Fragment>
  )
}

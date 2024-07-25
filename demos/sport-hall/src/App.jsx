import * as THREE from 'three'
import { useLayoutEffect } from 'react'
import { applyProps, Canvas } from '@react-three/fiber'
import { useGLTF, useBoxProjectedEnv, CubeCamera, Environment, OrbitControls, BakeShadows } from '@react-three/drei'
import { useControls } from 'leva'

import courtModel from './court.glb?url'

export default function App() {
  return (
    <Canvas frameloop="demand" dpr={[1, 1.5]} shadows camera={{ near: 0.1, far: 40, fov: 75 }}>
      <fog attach="fog" args={['purple', 0, 130]} />
      <ambientLight intensity={0.1} />
      <group position={[0, -1, 0]}>
        <spotLight castShadow intensity={10} angle={0.1} position={[-200, 220, -100]} shadow-mapSize={[2048, 2048]} shadow-bias={-0.000001} />
        <spotLight angle={0.1} position={[-250, 120, -200]} intensity={1} castShadow shadow-mapSize={[50, 50]} shadow-bias={-0.000001} />
        <spotLight angle={0.1} position={[250, 120, 200]} intensity={1} castShadow shadow-mapSize={[50, 50]} shadow-bias={-0.000001} />
        <Court />
        <Floor />
      </group>
      <OrbitControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
      <Environment files="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/hdris/noon-grass/noon_grass_1k.hdr" background />
      <BakeShadows />
    </Canvas>
  )
}

function Court(props) {
  const { scene } = useGLTF(courtModel)
  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) {
        applyProps(o, { castShadow: true, receiveShadow: true, 'material-envMapIntensity': 0.1 })
      }
    })
    const floor = scene.getObjectByName('GymFloor_ParquetShader_0')
    if (floor) floor.parent.remove(floor)
  }, [scene])
  return <primitive object={scene} {...props} />
}

function Floor(props) {
  const { nodes, materials } = useGLTF(courtModel)
  const { up, scale, ...config } = useControls({
    up: { value: -0.5, min: -10, max: 10 },
    scale: { value: 27, min: 0, max: 50 },
    roughness: { value: 0.06, min: 0, max: 0.15, step: 0.001 },
    envMapIntensity: { value: 1, min: 0, max: 5 }
  })
  const projection = useBoxProjectedEnv([0, up, 0], [scale, scale, scale])
  return (
    <CubeCamera frames={1} position={[0, 0.5, 0]} rotation={[0, 0, 0]} resolution={2048} near={1} far={1000} {...props}>
      {(texture) => (
        <mesh receiveShadow position={[-13.68, -0.467, 17.52]} scale={0.02} geometry={nodes.GymFloor_ParquetShader_0.geometry} dispose={null}>
          <meshStandardMaterial
            map={materials.ParquetShader.map}
            normalMap={materials.ParquetShader.normalMap}
            normalMap-encoding={THREE.LinearEncoding}
            envMap={texture}
            metalness={0.0}
            normalScale={[0.25, -0.25]}
            color="#aaa"
            {...projection}
            {...config}
          />
        </mesh>
      )}
    </CubeCamera>
  )
}

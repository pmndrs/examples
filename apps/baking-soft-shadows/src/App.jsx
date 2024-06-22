import * as THREE from 'three'
import { useLayoutEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, AccumulativeShadows, RandomizedLight, OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { FlakesTexture } from 'three-stdlib'

export default function App() {
  return (
    <Canvas shadows camera={{ position: [4, 2.5, 8], fov: 35 }}>
      <group position={[0, -0.5, 0]}>
        <Center top>
          <Suzi rotation={[-0.63, 0, 0]} scale={2} />
        </Center>
        <Center top position={[-2, 0, 1]}>
          <mesh castShadow>
            <sphereGeometry args={[0.25, 64, 64]} />
            <meshStandardMaterial color="lightblue" />
          </mesh>
        </Center>
        <Center top position={[2.5, 0, 1]}>
          <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="indianred" />
          </mesh>
        </Center>
        <AccumulativeShadows temporal frames={100} color="orange" colorBlend={2} toneMapped={true} alphaTest={0.75} opacity={2} scale={12}>
          <RandomizedLight intensity={Math.PI} amount={8} radius={4} ambient={0.5} position={[5, 5, -10]} bias={0.001} />
        </AccumulativeShadows>
      </group>
      <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      <Environment preset="city" />
    </Canvas>
  )
}

function Suzi(props) {
  const { scene, materials } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/suzanne-high-poly/model.gltf')
  useLayoutEffect(() => {
    scene.traverse((obj) => obj.isMesh && (obj.receiveShadow = obj.castShadow = true))
    materials.default.color.set('orange')
    materials.default.roughness = 0
    materials.default.normalMap = new THREE.CanvasTexture(new FlakesTexture(), THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping)
    materials.default.normalMap.repeat.set(40, 40)
    materials.default.normalScale.set(0.1, 0.1)
  })
  return <primitive object={scene} {...props} />
}

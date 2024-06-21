import { useState, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export function Soda(props) {
  const ref = useRef()
  const [hovered, spread] = useHover()
  const { nodes, materials } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/soda-bottle/model.gltf')
  useFrame((state, delta) => (ref.current.rotation.y += delta))
  return (
    <group ref={ref} {...props} {...spread} dispose={null}>
      <mesh geometry={nodes.Mesh_sodaBottle.geometry}>
        <meshStandardMaterial color={hovered ? 'red' : 'green'} roughness={0.33} metalness={0.8} envMapIntensity={2} />
      </mesh>
      <mesh geometry={nodes.Mesh_sodaBottle_1.geometry} material={materials.red} material-envMapIntensity={0} />
    </group>
  )
}

function useHover() {
  const [hovered, hover] = useState(false)
  return [hovered, { onPointerOver: (e) => hover(true), onPointerOut: () => hover(false) }]
}

export function Duck(props) {
  const { scene } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/duck/model.gltf')
  return <primitive object={scene} {...props} />
}

export function Candy(props) {
  const { scene } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/candy-bucket/model.gltf')
  useFrame((state, delta) => (scene.rotation.z = scene.rotation.y += delta))
  return <primitive object={scene} {...props} />
}

export function Flash(props) {
  const { scene } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/lightning/model.gltf')
  useFrame((state, delta) => (scene.rotation.y += delta))
  return <primitive object={scene} {...props} />
}

export function Apple(props) {
  const { scene } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/apple-half/model.gltf')
  useFrame((state, delta) => (scene.rotation.y += delta))
  return <primitive object={scene} {...props} />
}

export function Target(props) {
  const { scene } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/target-stand/model.gltf')
  useFrame((state, delta) => (scene.rotation.y += delta))
  return <primitive object={scene} {...props} />
}

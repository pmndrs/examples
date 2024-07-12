import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, useCursor, Outlines, AccumulativeShadows, RandomizedLight, OrbitControls, Bounds, Environment } from '@react-three/drei'
import { useControls } from 'leva'

import faucetModel from './faucet-transformed.glb'

function Faucet({ name }) {
  const ref = useRef()
  const [hovered, hover] = useState()
  const { nodes } = useGLTF(faucetModel)
  // Filter out all meshes belonging to a particular faucet
  const meshes = Object.values(nodes).filter((node) => node.isMesh && node.name.startsWith(name))
  useCursor(hovered)
  return (
    <group ref={ref} onPointerOver={(e) => (e.stopPropagation(), hover(true))} onPointerOut={() => hover(false)}>
      {meshes.map(({ uuid, geometry, material }) => (
        <mesh castShadow receiveShadow key={uuid} geometry={geometry} material={material}>
          <Outlines
            screenspace
            toneMapped={false}
            polygonOffset
            polygonOffsetFactor={100}
            transparent
            opacity={hovered * 1}
            color="white"
            angle={Math.PI}
            thickness={8}
          />
        </mesh>
      ))}
    </group>
  )
}

function Faucets(props) {
  // This component splits a GLTF up into parts
  return (
    <group {...props}>
      {[1, 2, 3, 4, 5, 6, 7].map((id) => (
        <Faucet key={id} name={`pipa${id}`} />
      ))}
    </group>
  )
}

export default function App() {
  const { radius, ambient, color } = useControls({
    color: { value: '#0c575f' },
    radius: { value: 3, min: 0, max: 10 },
    ambient: { value: 0.6, min: 0, max: 1 }
  })
  return (
    <Canvas shadows camera={{ position: [-4.5, 1.5, 4], fov: 25 }}>
      <ambientLight intensity={0.5 * Math.PI} />
      <group position={[0, -0.25, 0]}>
        <Faucets scale={0.03} rotation={[0, -Math.PI / 2, 0]} position={[0, 0.001, 0]} />
        <AccumulativeShadows resolution={1024} frames={100} color={color} alphaTest={0.68} colorBlend={1.5} opacity={1.65} scale={8}>
          <RandomizedLight radius={radius} ambient={ambient} position={[10, 5, -15]} bias={0.001} />
        </AccumulativeShadows>
      </group>
      <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr" background blur={0.7} />
      <OrbitControls makeDefault />
    </Canvas>
  )
}

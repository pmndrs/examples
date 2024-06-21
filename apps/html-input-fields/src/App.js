import * as THREE from 'three'
import { useState, useRef } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { useGLTF, AccumulativeShadows, RandomizedLight, Html, Text, Effects, Environment, Center, MeshTransmissionMaterial } from '@react-three/drei'
import { WaterPass } from 'three-stdlib'
import { ControlledInput } from './ControlledInput'

extend({ WaterPass })

export default function App() {
  return (
    // eventPrefix="client" to get client instead of offset coordinates
    // offset would reset xy to 0 when hovering the html overlay
    <Canvas eventPrefix="client" shadows camera={{ position: [1, 0.5, 10] }}>
      <color attach="background" args={['#f0f0f']} />
      <ambientLight intensity={1} />
      <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} castShadow />
      <pointLight position={[-10, 0, -10]} intensity={2} />
      <Input scale={2} position={[0.4, 0.25, -1]} />
      <group position={[0, -1, -2]}>
        <Center top rotation={[0, -Math.PI / 1.5, 0]} position={[0, 0, 3]}>
          <Model scale={0.8} />
        </Center>
        <Sphere scale={0.25} position={[-3, 0, 2]} />
        <Sphere scale={0.25} position={[-4, 0, -2]} />
        <Sphere scale={0.65} position={[3.5, 0, -2]} />
        <Text position={[0, 4, -10]} font="/Inter-Regular.woff" fontSize={6}>
          login
          <meshStandardMaterial color="#aaa" toneMapped={false} />
        </Text>
        <AccumulativeShadows temporal frames={100} alphaTest={0.8} opacity={0.75} scale={12}>
          <RandomizedLight amount={8} radius={4} ambient={0.5} intensity={1} position={[2.5, 5, -10]} />
        </AccumulativeShadows>
      </group>
      <Environment preset="city" />
      <Postpro />
      <Rig />
    </Canvas>
  )
}

function Postpro() {
  const ref = useRef()
  useFrame((state) => (ref.current.time = state.clock.elapsedTime * 3))
  return (
    <Effects>
      <waterPass ref={ref} factor={0.5} />
    </Effects>
  )
}

function Rig({ vec = new THREE.Vector3() }) {
  useFrame((state) => {
    state.camera.position.lerp(vec.set(1 + state.pointer.x, 0.5, 3), 0.01)
    state.camera.lookAt(0, 0, 0)
  })
}

function Sphere(props) {
  return (
    <Center top {...props}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial />
      </mesh>
    </Center>
  )
}

function Model(props) {
  const { nodes } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bunny/model.gltf')
  return (
    <mesh castShadow receiveShadow geometry={nodes.bunny.geometry} {...props}>
      <MeshTransmissionMaterial backside thickness={0.2} anisotropicBlur={0.1} chromaticAberration={0.1} clearcoat={1} />
    </mesh>
  )
}

function Input(props) {
  const [text, set] = useState('hello world ...')
  return (
    <group {...props}>
      <Text position={[-1.2, -0.022, 0]} anchorX="0px" font="/Inter-Regular.woff" fontSize={0.335} letterSpacing={-0.0}>
        {text}
        <meshStandardMaterial color="black" />
      </Text>
      <mesh position={[0, -0.022, 0]} scale={[2.5, 0.48, 1]}>
        <planeGeometry />
        <meshBasicMaterial transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <Html transform>
        <ControlledInput type={text} onChange={(e) => set(e.target.value)} value={text} />
      </Html>
    </group>
  )
}

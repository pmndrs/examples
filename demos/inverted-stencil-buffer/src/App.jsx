import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Mask, useMask, useGLTF, Bounds, PivotControls, Environment, OrbitControls, RoundedBox, Float } from '@react-three/drei'
import { useControls } from 'leva'

import reactModel from './react-transformed.glb?url'

export function App() {
  const { invert } = useControls({ invert: false })
  return (
    <Canvas shadows>
      <directionalLight position={[1, 2, 1.5]} intensity={0.5} castShadow />
      <hemisphereLight intensity={1.5} groundColor="red" />
      <Suspense fallback={null}>
        <CircularMask />
        <CircularMask position={[2, 0, 0]} />
        <Bounds fit clip observe>
          <Float floatIntensity={4} rotationIntensity={0} speed={4}>
            <Atom invert={invert} scale={1.5} />
          </Float>
          <Box color="#EAC435" args={[1, 5, 1]} rotation-y={Math.PI / 4} position={[0, 0, -2]} />
          <Box color="#03CEA4" args={[2, 2, 2]} position={[-2, 0, -2]} />
          <Box color="#FB4D3D" args={[2, 2, 2]} position={[2, 0, -2]} />
        </Bounds>
        <Environment preset="city" />
      </Suspense>
      <OrbitControls makeDefault />
    </Canvas>
  )
}

const CircularMask = (props) => (
  <group {...props}>
    <PivotControls offset={[0, 0, 1]} activeAxes={[true, true, false]} disableRotations depthTest={false}>
      <Frame position={[0, 0, 1]} />
      <Mask id={1} position={[0, 0, 0.95]}>
        <circleGeometry args={[0.8, 64]} />
      </Mask>
    </PivotControls>
  </group>
)

const Box = ({ args = [1, 4, 1], radius = 0.05, smoothness = 4, color = 'black', ...boxProps }) => (
  <RoundedBox args={args} radius={radius} smoothness={smoothness} {...boxProps}>
    <meshPhongMaterial color={color} />
  </RoundedBox>
)

const Frame = (props) => (
  <mesh {...props}>
    <ringGeometry args={[0.785, 0.85, 64]} />
    <meshPhongMaterial color="black" />
  </mesh>
)

function Atom({ invert, ...props }) {
  const stencil = useMask(1, invert)
  const { nodes } = useGLTF(reactModel)
  return (
    <mesh castShadow receiveShadow geometry={nodes.atom.geometry} {...props} dispose={null}>
      <meshPhongMaterial color="#33BBFF" {...stencil} />
    </mesh>
  )
}

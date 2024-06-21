import { Suspense } from 'react'
import { Mask, useMask, useGLTF, PivotControls, RoundedBox, Float } from '@react-three/drei'

export default function App(props) {
  return (
    <group {...props}>
      <directionalLight position={[1, 2, 1.5]} intensity={0.5} castShadow />
      <hemisphereLight intensity={1.5} groundColor="red" />
      <Suspense fallback={null}>
        <PivotControls scale={1.5} rotation={[0, 0, Math.PI]} offset={[0, 0, 1]} activeAxes={[true, true, false]} disableRotations depthTest={false}>
          <Frame position={[0, 0, 1]} />
          <Mask id={1} position={[0, 0, 0.95]}>
            <circleGeometry args={[1.5, 64]} />
          </Mask>
        </PivotControls>
        <Float floatIntensity={4} rotationIntensity={0} speed={4}>
          <Atom invert={false} scale={1.5} />
        </Float>
        <Box color="#EAC435" args={[1, 5, 1]} rotation-y={Math.PI / 4} position={[0, 0, -2]} />
        <Box color="#03CEA4" args={[2, 2, 2]} position={[-2, 0, -2]} />
        <Box color="#FB4D3D" args={[2, 2, 2]} position={[2, 0, -2]} />
      </Suspense>
    </group>
  )
}

function Box({ args = [1, 4, 1], radius = 0.05, smoothness = 4, color = 'black', ...boxProps }) {
  return (
    <RoundedBox args={args} radius={radius} smoothness={smoothness} {...boxProps}>
      <meshPhongMaterial color={color} />
    </RoundedBox>
  )
}

function Frame(props) {
  return (
    <mesh {...props}>
      <ringGeometry args={[1.35, 1.5, 64]} />
      <meshPhongMaterial color="black" />
    </mesh>
  )
}

function Atom({ invert, ...props }) {
  const stencil = useMask(1, invert)
  const { nodes } = useGLTF('/react-transformed.glb')
  return (
    <mesh castShadow receiveShadow geometry={nodes.atom.geometry} {...props} dispose={null}>
      <meshPhongMaterial color="#33BBFF" {...stencil} />
    </mesh>
  )
}

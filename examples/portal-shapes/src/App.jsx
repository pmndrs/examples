import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center, Preload, Lightformer, Environment, CameraControls, RenderTexture, ContactShadows, MeshTransmissionMaterial } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import Turtle from './sandboxes/Turtle'
import Basic from './sandboxes/Basic'
import PingPong from './sandboxes/PingPong'
import Shoe from './sandboxes/Shoe'
import Stencil from './sandboxes/Stencil'
import Rocket from './sandboxes/Rocket'

import boldFont from './bold.blob?url'

export default function App() {
  return (
    <Canvas dpr={[1.5, 2]} camera={{ position: [-20, 40, 30], fov: 45, near: 1, far: 300 }}>
      {/** The physics world */}
      <Physics gravity={[0, -60, 0]}>
        <Letter char="P" position={[1, 50, -1]} rotation={[0, 0, 0]}>
          {/** The sandboxes dropped into here have no idea what's going to happen.
               For all intents and purposes they're just self-contained components.  */}
          <Turtle />
        </Letter>
        <Letter char="M" position={[2, 60, -2]} rotation={[4, 5, 6]}>
          <Shoe scale={5} />
        </Letter>
        <Letter char="N" position={[3, 70, 2]} rotation={[7, 8, 9]}>
          <Rocket position={[-1, -1, 0]} scale={0.6} />
        </Letter>
        <Letter char="D" position={[-1, 80, 3]} rotation={[10, 11, 12]}>
          <Basic scale={3} />
        </Letter>
        <Letter char="R" position={[-2, 90, 2]} rotation={[13, 14, 15]}>
          <PingPong />
        </Letter>
        <Letter char="S" position={[-3, 100, -3]} rotation={[16, 17, 18]} stencilBuffer>
          <Stencil scale={2} />
        </Letter>
        {/** Invisible walls */}
        <CuboidCollider position={[0, -6, 0]} type="fixed" args={[100, 1, 100]} />
        <CuboidCollider position={[0, 0, -30]} type="fixed" args={[30, 100, 1]} />
        <CuboidCollider position={[0, 0, 10]} type="fixed" args={[30, 100, 1]} />
        <CuboidCollider position={[-30, 0, 0]} type="fixed" args={[1, 100, 30]} />
        <CuboidCollider position={[30, 0, 0]} type="fixed" args={[1, 100, 30]} />
      </Physics>
      {/** Environment (for reflections) */}
      <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr" resolution={1024}>
        {/** On top of the HDRI we add some rectangular and circular shapes for nicer reflections */}
        <group rotation={[-Math.PI / 3, 0, 0]}>
          <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
          {[2, 0, 2, 0, 2, 0, 2, 0].map((x, i) => (
            <Lightformer key={i} form="circle" intensity={4} rotation={[Math.PI / 2, 0, 0]} position={[x, 4, i * 4]} scale={[4, 1, 1]} />
          ))}
          <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[50, 2, 1]} />
          <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[50, 2, 1]} />
        </group>
      </Environment>
      {/** Contact shadows for naive soft shadows */}
      <ContactShadows smooth={false} scale={100} position={[0, -5.05, 0]} blur={0.5} opacity={0.75} />
      {/** Yomotsu/camera-controls, a better replacement for OrbitControls */}
      <CameraControls makeDefault dollyToCursor minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      {/** Makes sure everything is processed and GPU uploaded before Threejs "sees" it */}
      <Preload all />
    </Canvas>
  )
}

function Letter({ char, children, stencilBuffer = false, ...props }) {
  const main = useRef()
  const contents = useRef()
  const events = useThree((state) => state.events)
  const controls = useThree((state) => state.controls)
  // The letters contents are moved to its whereabouts in world coordinates
  useFrame(() => contents.current.matrix.copy(main.current.matrixWorld))
  return (
    /** A physics rigid body */
    <RigidBody restitution={0.1} colliders="cuboid" {...props}>
      {/** Center each letter */}
      <Center ref={main}>
        <Text3D
          bevelEnabled
          onDoubleClick={(e) => (e.stopPropagation(), controls.fitToBox(main.current, true))}
          font={boldFont}
          smooth={1}
          scale={0.125}
          size={80}
          height={4}
          curveSegments={10}
          bevelThickness={10}
          bevelSize={2}
          bevelOffset={0}
          bevelSegments={5}>
          {char}
          <MeshTransmissionMaterial clearcoat={1} samples={3} thickness={40} chromaticAberration={0.25} anisotropy={0.4}>
            {/** Render a portalled scene into the "buffer" attribute of transmission material, which is a texture.
                 Since we're moving the contents with the letter shape in world space we take the standard event compute. */}
            <RenderTexture attach="buffer" stencilBuffer={stencilBuffer} width={512} height={512} compute={events.compute}>
              {/** Everything in here is self-contained, behaves like a regular canvas, but we're *in* the texture */}
              <color attach="background" args={['#4899c9']} />
              <group ref={contents} matrixAutoUpdate={false}>
                {/** Drop the children in here, this is where the sandboxes land. */}
                {children}
              </group>
              <Preload all />
            </RenderTexture>
          </MeshTransmissionMaterial>
        </Text3D>
      </Center>
    </RigidBody>
  )
}

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, PivotControls, MeshPortalMaterial, Sky, Environment, OrbitControls, Float, ContactShadows } from '@react-three/drei'
import { useControls } from 'leva'

function Model({ name, floatIntensity = 10, ...props }) {
  const { nodes } = useGLTF('/ao_shapes.glb')
  const [hovered, hover] = useState(false)
  return (
    <Float {...props} rotationIntensity={2} floatIntensity={floatIntensity} speed={1}>
      <mesh
        onPointerOver={(e) => (e.stopPropagation(), hover(true))}
        onPointerOut={() => hover(false)}
        geometry={nodes[name].geometry}
        material={nodes[name].material}
        material-color={hovered ? 'lightgreen' : 'white'}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </Float>
  )
}

export default function App() {
  const { worldUnits, portal1, portal2, envBlur } = useControls({
    worldUnits: { value: false },
    portal1: { value: 0.25, min: 0, max: 10 },
    portal2: { value: 0.25, min: 0, max: 1 },
    envBlur: { value: 0.2, min: 0, max: 1 }
  })
  return (
    <Canvas camera={{ position: [8, -3, 10], fov: 75 }}>
      <Sky />
      <ambientLight intensity={0.7} />
      <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <group position={[0, -2, 0]}>
        <Model scale={1.5} position={[0, 3, 0]} rotation={[0, Math.PI, 0]} name="VR_Headset" />
        <ContactShadows renderOrder={-100} position={[0, -2, 0]} opacity={0.5} blur={1.5} far={10} scale={50} />
        <PivotControls offset={[0, 5, -5]} scale={3} activeAxes={[true, true, false]}>
          <mesh position={[0, 5, -5]}>
            <circleGeometry args={[7, 64]} />
            {/** A portal is just a material */}
            <MeshPortalMaterial worldUnits={worldUnits} transparent blur={portal1}>
              <ambientLight intensity={0.7} />
              <Model scale={0.4} position={[0, 0, -2.55]} name="Headphones" floatIntensity={30} />
              <Environment preset="city" background blur={envBlur} />
              <mesh position={[0, 0, -10]}>
                <circleGeometry args={[5, 64]} />
                {/** You can have portals inside portals */}
                <MeshPortalMaterial transparent blur={portal2}>
                  <ambientLight intensity={0.7} />
                  <Model scale={0.15} position={[0, -1, -10]} rotation={[0, 0, 0]} name="Roundcube001" floatIntensity={100} />
                  <Environment preset="dawn" background blur={envBlur} />
                </MeshPortalMaterial>
              </mesh>
            </MeshPortalMaterial>
          </mesh>
        </PivotControls>
      </group>
      <OrbitControls makeDefault />
    </Canvas>
  )
}

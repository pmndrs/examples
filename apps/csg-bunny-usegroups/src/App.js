import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { useGLTF, AccumulativeShadows, RandomizedLight, OrbitControls, PivotControls, MeshTransmissionMaterial, Center, Environment } from '@react-three/drei'
import { useRef } from 'react'
import { Geometry, Base, Addition, Subtraction } from '@react-three/csg'

export default function App() {
  return (
    <Canvas shadows camera={{ position: [4, 0.5, 10], fov: 25 }}>
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, -4]} shadow-mapSize={1024} castShadow />
      <group position={[0.5, -1.25, 0]}>
        <Center top>
          <Bunny />
        </Center>
        <AccumulativeShadows temporal frames={100} alphaTest={0.85} opacity={0.85} scale={12}>
          <RandomizedLight amount={8} radius={5} ambient={0.5} intensity={1} position={[5, 5, -5]} bias={0.001} />
        </AccumulativeShadows>
      </group>
      <Environment preset="city" background blur={1} />
      <OrbitControls makeDefault />
    </Canvas>
  )
}

function Bunny() {
  const csg = useRef()
  const { nodes } = useGLTF('/bunny-transformed.glb')
  return (
    <mesh receiveShadow castShadow>
      {/** This will yield a regular THREE.BufferGeometry that needs to be paired with a mesh.
           If "useGroups" is true each op can have its own material. */}
      <Geometry ref={csg} useGroups>
        {/** All operations behave like THREE.Mesh, they can be transformed, have geometry, and a material.
             The chain begins with a base geometry, where all operations are carried out on.  */}
        <Base scale={1.5} position={[0, -1.04, 0]} geometry={nodes.bunny.geometry}>
          <MeshTransmissionMaterial backside samples={8} resolution={512} thickness={0.3} roughness={0.2} anisotropy={1} chromaticAberration={0.2} />
        </Base>
        {/** Now come the boolean operations: Addition, Subtraction, Difference and Intersection. */}
        <Subtraction position={[-1, 1, 1]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="orange" side={THREE.DoubleSide} />
        </Subtraction>
        {/** CSG.Geometry is re-usable, form your own hierachies with previously created CSG geometries. */}
        <Addition scale={0.5} rotation={[0.5, 0.2, Math.PI / 4]} position={[-0.75, 0.5, -0.25]}>
          <CrossGeometry />
          <meshStandardMaterial color="skyblue" side={THREE.DoubleSide} />
        </Addition>
        {/** You can deeply nest operations, or control them with other components. */}
        <PivotControls lineWidth={3} scale={0.5} anchor={[0, 0, 0]} onDrag={() => csg.current.update()}>
          <group scale={0.65} position={[0.5, 0.5, 0.9]}>
            <Subtraction>
              <dodecahedronGeometry />
              <meshStandardMaterial color="hotpink" side={THREE.DoubleSide} />
            </Subtraction>
          </group>
        </PivotControls>
      </Geometry>
    </mesh>
  )
}

const boxGeometry = new THREE.BoxGeometry()
function CrossGeometry() {
  return (
    <Geometry>
      <Base geometry={boxGeometry} scale={[2, 0.5, 0.5]} />
      <Addition geometry={boxGeometry} scale={[0.5, 2, 0.5]} />
    </Geometry>
  )
}

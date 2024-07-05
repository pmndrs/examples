import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Float, Instance, Instances } from '@react-three/drei'

const spheres = [
  [1, 'orange', 0.05, [-4, -1, -1]],
  [0.75, 'hotpink', 0.1, [-4, 2, -2]],
  [1.25, 'aquamarine', 0.2, [4, -3, 2]],
  [1.5, 'lightblue', 0.3, [-4, -2, -3]],
  [2, 'pink', 0.3, [-4, 2, -4]],
  [2, 'skyblue', 0.3, [-4, 2, -4]],
  [1.5, 'orange', 0.05, [-4, -1, -1]],
  [2, 'hotpink', 0.1, [-4, 2, -2]],
  [1.5, 'aquamarine', 0.2, [4, -3, 2]],
  [1.25, 'lightblue', 0.3, [-4, -2, -3]],
  [1, 'pink', 0.3, [-4, 2, -4]],
  [1, 'skyblue', 0.3, [-4, 2, -4]]
]

export default function App() {
  return (
    <Instances renderOrder={-1000}>
      <ambientLight intensity={0.3} onPointerOver={() => null} />
      <pointLight position={[10, 10, 5]} />
      <pointLight position={[-10, -10, -5]} />
      <sphereGeometry args={[1, 64, 64]} />
      <meshBasicMaterial depthTest={false} />
      {spheres.map(([scale, color, speed, position], index) => (
        <Sphere key={index} scale={scale} color={color} speed={speed} position={position} />
      ))}
      <Float rotationIntensity={2} floatIntensity={10} speed={2}>
        <Turtle position={[0, 0, -2]} rotation={[0, Math.PI, 0]} scale={26} />
      </Float>
    </Instances>
  )
}

function Sphere({ position, scale = 1, speed = 0.1, color = 'white' }) {
  return (
    <Float rotationIntensity={40} floatIntensity={20} speed={speed}>
      <Instance position={position} scale={scale} color={color} />
    </Float>
  )
}

/*
Author: DigitalLife3D (https://sketchfab.com/DigitalLife3D)
License: CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)
Source: https://sketchfab.com/3d-models/model-52a-kemps-ridley-sea-turtle-no-id-7aba937dfbce480fb3aca47be3a9740b
Title: Model 52A - Kemps Ridley Sea Turtle (no ID)
*/
function Turtle(props) {
  const { scene, animations } = useGLTF('/model_52a_-_kemps_ridley_sea_turtle_no_id-transformed.glb')
  const { actions, mixer } = useAnimations(animations, scene)
  useEffect(() => {
    mixer.timeScale = 0.5
    actions['Swim Cycle'].play()
  }, [])
  useFrame((state) => (scene.rotation.z = Math.sin(state.clock.elapsedTime / 4) / 2))
  return <primitive object={scene} {...props} />
}

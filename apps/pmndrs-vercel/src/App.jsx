import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, Edges } from '@react-three/drei'
import { Physics, useCompoundBody, useCylinder } from '@react-three/cannon'
import { LayerMaterial, Depth, Fresnel } from 'lamina'

const vec = new THREE.Vector3()
const white = new THREE.MeshBasicMaterial({ color: '#fefefe', toneMapped: false })
const black = new THREE.MeshBasicMaterial({ color: 'black', toneMapped: false })
const cylinder = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 3)

export const App = ({ amount = 12 }) => (
  <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
    <Physics gravity={[0, 1, 0]}>
      {Array.from({ length: amount }, (_, i) => {
        const El = i % 2 ? Pmndrs : Vercel
        return <El key={i} mass={4} angularDamping={0.4} linearDamping={0.8} position={[Math.random(), Math.random(), Math.random()]} />
      })}
      <Cursor mass={15} angularDamping={0.5} linearDamping={0.5} position={[0, 0, 10]} />
    </Physics>
  </Canvas>
)

function Vercel(props) {
  const [ref, api] = useCylinder(() => ({ args: [0.6, 0.6, 0.5, 3], ...props }))
  useFrame(() => api.applyForce(vec.setFromMatrixPosition(ref.current.matrix).normalize().multiplyScalar(-40).toArray(), [0, 0, 0]))
  return (
    <mesh ref={ref} geometry={cylinder} material={white}>
      <Edges material={black} />
    </mesh>
  )
}

function Pmndrs(props) {
  const { nodes } = useGLTF('/pmndrs.glb')
  const [ref, api] = useCompoundBody(() => ({
    ...props,
    shapes: [
      { type: 'Box', args: [0.65, 0.65, 0.5], position: [0.18, 0.18, 0] },
      { type: 'Box', args: [0.3, 0.3, 0.5], position: [-0.35, 0, 0] },
      { type: 'Box', args: [0.3, 0.3, 0.5], position: [0, -0.35, 0] }
    ]
  }))
  useFrame(() => api.applyForce(vec.setFromMatrixPosition(ref.current.matrix).normalize().multiplyScalar(-40).toArray(), [0, 0, 0]))
  return (
    <group ref={ref}>
      <mesh scale={[0.188, 0.188, 0.97]} position={[-0.02, -0.5, 0.022]} geometry={nodes.logo.geometry} material={white}>
        <Edges scale={1.005} material={black} />
      </mesh>
    </group>
  )
}

function Cursor({ speed = 10, gradient = 0.7, ...props }) {
  const { nodes } = useGLTF('/cursor.glb')
  const viewport = useThree((state) => state.viewport)
  const [ref, api] = useCompoundBody(() => ({
    ...props,
    shapes: [
      { type: 'Cylinder', args: [0.6, 0.6, 0.5, 3], position: [0, 0.2, 0], rotation: [Math.PI / 2, Math.PI, 0] },
      { type: 'Box', args: [0.25, 1, 0.3], position: [0, -0.45, 0] }
    ]
  }))
  useFrame((state) => {
    vec.setFromMatrixPosition(ref.current.matrix)
    api.velocity.set(((state.mouse.x * viewport.width) / 2 - vec.x) * speed, ((state.mouse.y * viewport.height) / 2 - vec.y) * speed, -vec.z)
  })
  return (
    <group ref={ref}>
      <mesh scale={[0.5, 1, 0.55]} rotation={[0, Math.PI / 2, 0]} geometry={nodes.Cube.geometry}>
        <LayerMaterial toneMapped={false}>
          <Depth colorA="#ff0080" colorB="black" alpha={1} mode="normal" near={0.5 * gradient} far={0.5} origin={[0, 0, 0]} />
          <Depth colorA="blue" colorB="#f7b955" alpha={1} mode="add" near={2 * gradient} far={2} origin={[1, 1, 1]} />
          <Depth colorA="green" colorB="#f7b955" alpha={1} mode="add" near={3 * gradient} far={3} origin={[-1, -1, -1]} />
          <Depth colorA="white" colorB="red" alpha={1} mode="overlay" near={1.5 * gradient} far={1.5} origin={[1, -1, -1]} />
          <Fresnel mode="add" color="white" intensity={0.75} power={2} bias={0.05} />
        </LayerMaterial>
        <Edges scale={1.003} color="white" />
      </mesh>
    </group>
  )
}

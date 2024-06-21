import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bvh, OrbitControls, useHelper } from '@react-three/drei'
import { MeshBVHVisualizer } from 'three-mesh-bvh'
import { Perf } from 'r3f-perf'
import { useControls } from 'leva'
import { Rays } from './Rays'

function Torus(props) {
  const mesh = useRef()
  const sphere = useRef()
  useHelper(mesh, MeshBVHVisualizer)
  useFrame((state, delta) => (mesh.current.rotation.x = mesh.current.rotation.y += delta))
  return (
    <mesh
      ref={mesh}
      {...props}
      onPointerMove={(e) => sphere.current.position.copy(mesh.current.worldToLocal(e.point))}
      onPointerOver={() => (sphere.current.visible = true)}
      onPointerOut={() => (sphere.current.visible = false)}>
      <torusKnotGeometry args={[1, 0.4, 200, 50]} />
      <meshNormalMaterial />
      <mesh raycast={() => null} ref={sphere} visible={false}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color="orange" toneMapped={false} />
      </mesh>
    </mesh>
  )
}

export default function App() {
  const { enabled } = useControls({ enabled: true })
  return (
    <Canvas camera-position-z={40} camera-far={100}>
      <color attach="background" args={['#202025']} />
      <Perf position="bottom-right" style={{ margin: 10 }} />
      {/** Anything that Bvh wraps is getting three-mesh-bvh's acceleratedRaycast.
           Click on "enabled" to see what normal raycast performance in threejs looks like. */}
      <Bvh firstHitOnly enabled={enabled}>
        <Rays>
          <Torus />
        </Rays>
      </Bvh>
      <OrbitControls />
    </Canvas>
  )
}

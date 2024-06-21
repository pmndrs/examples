import * as THREE from 'three'
import { useRef, useMemo, useLayoutEffect } from 'react'
import { Canvas, extend } from '@react-three/fiber'
import { shaderMaterial, CameraControls } from '@react-three/drei'
import niceColors from 'nice-color-palettes'

const MeshEdgesMaterial = shaderMaterial(
  {
    color: new THREE.Color('white'),
    size: new THREE.Vector3(1, 1, 1),
    thickness: 0.01,
    smoothness: 0.2
  },
  /*glsl*/ `varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * viewMatrix * instanceMatrix * vec4(position, 1.0);
  }`,
  /*glsl*/ `varying vec3 vPosition;
  uniform vec3 size;
  uniform vec3 color;
  uniform float thickness;
  uniform float smoothness;
  void main() {
    vec3 d = abs(vPosition) - (size * 0.5);
    float a = smoothstep(thickness, thickness + smoothness, min(min(length(d.xy), length(d.yz)), length(d.xz)));
    gl_FragColor = vec4(color, 1.0 - a);
  }`
)

extend({ MeshEdgesMaterial })
const o = new THREE.Object3D()
const c = new THREE.Color()

function Boxes({ length = 100000, size = [0.15, 0.15, 0.15], ...props }) {
  const ref = useRef()
  const outlines = useRef()
  const colors = useMemo(() => new Float32Array(Array.from({ length }, () => c.set(niceColors[17][Math.floor(Math.random() * 5)]).toArray()).flat()), [length])
  useLayoutEffect(() => {
    let i = 0
    const root = Math.round(Math.pow(length, 1 / 3))
    const halfRoot = root / 2
    for (let x = 0; x < root; x++)
      for (let y = 0; y < root; y++)
        for (let z = 0; z < root; z++) {
          const id = i++
          o.rotation.set(Math.random(), Math.random(), Math.random())
          o.position.set(halfRoot - x + Math.random(), halfRoot - y + Math.random(), halfRoot - z + Math.random())
          o.updateMatrix()
          ref.current.setMatrixAt(id, o.matrix)
        }
    ref.current.instanceMatrix.needsUpdate = true
    // Re-use geometry + instance matrix
    outlines.current.geometry = ref.current.geometry
    outlines.current.instanceMatrix = ref.current.instanceMatrix
  }, [length])
  return (
    <group {...props}>
      <instancedMesh ref={ref} args={[null, null, length]}>
        <boxGeometry args={size}>
          <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
        </boxGeometry>
        <meshLambertMaterial vertexColors toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={outlines} args={[null, null, length]}>
        <meshEdgesMaterial transparent polygonOffset polygonOffsetFactor={-10} size={size} color="black" thickness={0.001} smoothness={0.005} />
      </instancedMesh>
    </group>
  )
}

export function App() {
  return (
    <Canvas camera={{ position: [0, 0, 0.01] }}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[150, 150, 150]} intensity={1} />
      <Boxes />
      <CameraControls />
    </Canvas>
  )
}

import * as THREE from 'three'
import { useRef, useState, useContext, createContext, forwardRef, useImperativeHandle } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Hud, OrbitControls, RenderTexture, OrthographicCamera, PerspectiveCamera, Text, Environment } from '@react-three/drei'
import { suspend } from 'suspend-react'

const medium = import('@pmndrs/assets/fonts/inter_medium.woff')
const context = createContext()

export default function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5 * Math.PI} />
      <Torus scale={1.75} />
      <Viewcube />
      <OrbitControls />
      <Environment preset="city" />
    </Canvas>
  )
}

function Torus(props) {
  const [hovered, hover] = useState(false)
  return (
    <mesh onPointerOver={(e) => hover(true)} onPointerOut={(e) => hover(false)} {...props}>
      <torusGeometry args={[1, 0.25, 32, 100]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function Viewcube({ renderPriority = 1, matrix = new THREE.Matrix4() }) {
  const mesh = useRef(null)
  const { camera, viewport } = useThree()
  const [hovered, hover] = useState(null)

  useFrame(() => {
    // Spin mesh to the inverse of the default cameras matrix
    matrix.copy(camera.matrix).invert()
    mesh.current.quaternion.setFromRotationMatrix(matrix)
  })

  return (
    <Hud renderPriority={renderPriority}>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <Box ref={mesh} position={[viewport.width / 2 - 1, viewport.height / 2 - 1, 0]}>
        <FaceMaterial index={0}>front</FaceMaterial>
        <FaceMaterial index={1}>back</FaceMaterial>
        <FaceMaterial index={2}>top</FaceMaterial>
        <FaceMaterial index={3}>bottom</FaceMaterial>
        <FaceMaterial index={4}>left</FaceMaterial>
        <FaceMaterial index={5}>right</FaceMaterial>
      </Box>
      <ambientLight intensity={1} />
      <pointLight position={[200, 200, 100]} intensity={0.5} />
    </Hud>
  )
}

const Box = forwardRef(({ children, ...props }, fref) => {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  useFrame((state, delta) => (ref.current.rotation.x += delta))
  useImperativeHandle(fref, () => ref.current, [])
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerMove={(event) => (event.stopPropagation(), hover(event.face.materialIndex))}
      onPointerOut={() => hover(false)}>
      <boxGeometry />
      <context.Provider value={hovered}>{children}</context.Provider>
    </mesh>
  )
})

function FaceMaterial({ children, index, ...props }) {
  const hovered = useContext(context)
  return (
    <meshStandardMaterial attach={`material-${index}`} color={hovered === index ? 'hotpink' : 'orange'} {...props}>
      <RenderTexture frames={6} attach="map" anisotropy={16}>
        <color attach="background" args={['white']} />
        <OrthographicCamera makeDefault left={-1} right={1} top={1} bottom={-1} position={[0, 0, 10]} zoom={0.5} />
        <Text font={suspend(medium).default} color="black">
          {children}
        </Text>
      </RenderTexture>
    </meshStandardMaterial>
  )
}

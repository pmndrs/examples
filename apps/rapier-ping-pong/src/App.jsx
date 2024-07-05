import * as THREE from "three"
import { useCallback, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Text, useGLTF, useTexture } from "@react-three/drei"
import { Physics, RigidBody, CylinderCollider, CuboidCollider, BallCollider } from "@react-three/rapier"
import { EffectComposer, N8AO, TiltShift2, ToneMapping } from "@react-three/postprocessing"
import { proxy, useSnapshot } from "valtio"
import clamp from "lodash-es/clamp"
import { easing } from "maath"
import pingSound from "./resources/ping.mp3"
import logo from "./resources/crossp.jpg"
import bg from "./resources/bg.jpg"

const ping = new Audio(pingSound)
const state = proxy({
  count: 0,
  api: {
    pong(velocity) {
      ping.currentTime = 0
      ping.volume = clamp(velocity / 20, 0, 1)
      ping.play()
      if (velocity > 10) ++state.count
    },
    reset: () => (state.count = 0),
  },
})

export default function App({ ready }) {
  return (
    <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: false }} camera={{ position: [0, 5, 12], fov: 45 }}>
      <color attach="background" args={["#f0f0f0"]} />
      <ambientLight intensity={0.5 * Math.PI} />
      <spotLight decay={0} position={[-10, 15, -5]} angle={1} penumbra={1} intensity={2} castShadow shadow-mapSize={1024} shadow-bias={-0.0001} />
      <Physics gravity={[0, -40, 0]} timeStep="vary">
        {ready && <Ball position={[0, 5, 0]} />}
        <Paddle />
      </Physics>
      <EffectComposer disableNormalPass>
        <N8AO aoRadius={0.5} intensity={2} />
        <TiltShift2 blur={0.2} />
        <ToneMapping />
      </EffectComposer>
      <Bg />
    </Canvas>
  )
}

function Paddle({ vec = new THREE.Vector3(), dir = new THREE.Vector3() }) {
  const api = useRef()
  const model = useRef()
  const { count } = useSnapshot(state)
  const { nodes, materials } = useGLTF("/pingpong.glb")
  const contactForce = useCallback((payload) => {
    state.api.pong(payload.totalForceMagnitude / 100)
    model.current.position.y = -payload.totalForceMagnitude / 10000
  }, [])
  useFrame((state, delta) => {
    vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
    dir.copy(vec).sub(state.camera.position).normalize()
    vec.add(dir.multiplyScalar(state.camera.position.length()))
    api.current?.setNextKinematicTranslation({ x: vec.x, y: vec.y, z: 0 })
    api.current?.setNextKinematicRotation({ x: 0, y: 0, z: (state.pointer.x * Math.PI) / 10, w: 1 })
    easing.damp3(model.current.position, [0, 0, 0], 0.2, delta)
    easing.damp3(state.camera.position, [-state.pointer.x * 4, 2.5 + -state.pointer.y * 4, 12], 0.3, delta)
    state.camera.lookAt(0, 0, 0)
  })
  return (
    <RigidBody ccd canSleep={false} ref={api} type="kinematicPosition" colliders={false} onContactForce={contactForce}>
      <CylinderCollider args={[0.15, 1.75]} />
      <group ref={model} position={[0, 2, 0]} scale={0.15}>
        <Text anchorX="center" anchorY="middle" rotation={[-Math.PI / 2, 0, 0]} position={[0, 1, 0]} fontSize={10} children={count} />
        <group rotation={[1.88, -0.35, 2.32]} scale={[2.97, 2.97, 2.97]}>
          <primitive object={nodes.Bone} />
          <primitive object={nodes.Bone003} />
          <primitive object={nodes.Bone006} />
          <primitive object={nodes.Bone010} />
          <skinnedMesh castShadow receiveShadow material={materials.glove} material-roughness={1} geometry={nodes.arm.geometry} skeleton={nodes.arm.skeleton} />
        </group>
        <group rotation={[0, -0.04, 0]} scale={141.94}>
          <mesh castShadow receiveShadow material={materials.wood} geometry={nodes.mesh.geometry} />
          <mesh castShadow receiveShadow material={materials.side} geometry={nodes.mesh_1.geometry} />
          <mesh castShadow receiveShadow material={materials.foam} geometry={nodes.mesh_2.geometry} />
          <mesh castShadow receiveShadow material={materials.lower} geometry={nodes.mesh_3.geometry} />
          <mesh castShadow receiveShadow material={materials.upper} geometry={nodes.mesh_4.geometry} />
        </group>
      </group>
    </RigidBody>
  )
}

function Ball(props) {
  const api = useRef()
  const map = useTexture(logo)
  const { viewport } = useThree()
  const onCollisionEnter = useCallback(() => {
    state.api.reset()
    api.current.setTranslation({ x: 0, y: 5, z: 0 })
    api.current.setLinvel({ x: 0, y: 5, z: 0 })
  }, [])
  return (
    <group {...props}>
      <RigidBody ccd ref={api} angularDamping={0.8} restitution={1} canSleep={false} colliders={false} enabledTranslations={[true, true, false]}>
        <BallCollider args={[0.5]} />
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.5, 64, 64]} />
          <meshStandardMaterial map={map} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[0, -viewport.height * 2, 0]} restitution={2.1} onCollisionEnter={onCollisionEnter}>
        <CuboidCollider args={[1000, 2, 1000]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[0, viewport.height * 4, 0]} restitution={2.1} onCollisionEnter={onCollisionEnter}>
        <CuboidCollider args={[1000, 2, 1000]} />
      </RigidBody>
    </group>
  )
}

function Bg() {
  const texture = useTexture(bg)
  return (
    <mesh rotation={[0, Math.PI / 1.25, 0]} scale={100}>
      <sphereGeometry />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}

import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Reflector, useTexture } from '@react-three/drei'
import useStore from './store'

const HPI = Math.PI / 2
const vec = new THREE.Vector3()
const obj = new THREE.Object3D()
const red = new THREE.Color('#900909')

export default function App(props) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [-20, 20, 20], fov: 25 }}>
      <color attach="background" args={['#d0d0d0']} />
      <fog attach="fog" args={['#d0d0d0', 5, 10]} />
      <Suspense fallback={null}>
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 0]} intensity={1.5} />
        <directionalLight position={[-10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 20, 0]} intensity={1.5} />
        <directionalLight position={[0, -10, 0]} intensity={0.25} />
        <group position-y={-0.25}>
          <Graph position={[-0.7, -0.2, -1]} />
          <DancingDot />
          <Bust />
          <Explosion position={[0, 0.65, 0]} beat={0} />
          <Explosion position={[0.15, 0.25, 0]} beat={1} />
          <Ground />
        </group>
        <Intro />
      </Suspense>
    </Canvas>
  )
}

function Bust() {
  const ref = useRef()
  const time = useRef(0)
  const { scene, animations, materials } = useGLTF('/bust.glb')
  const { actions, mixer } = useAnimations(animations, ref)
  const { drums } = useStore((state) => state.audio)
  const track = useStore((state) => state.track)
  // Play all actions (the fragments flying off)
  useEffect(() => Object.keys(actions).forEach((key) => actions[key].play()), [])
  // Control the exploding statue and the inner materials color
  useFrame((_) => {
    mixer.timeScale = track.synthonly ? 0.125 : 1
    if (!track.synthonly) mixer.setTime((time.current = THREE.MathUtils.lerp(time.current, track.kicks * 1.25, track.kicks === 0 ? 0.25 : 0.15)))
    materials.inner.color.copy(red).multiplyScalar((drums.avg * drums.gain) / 30)
  })
  return <primitive scale={[0.2, 0.2, 0.2]} position={[0, -0.23, 0]} rotation={[0, -2.4, 0]} ref={ref} object={scene} />
}

function Explosion({ beat, ...props }) {
  const [state] = useState({ size: 0, signal: 0 })
  const sceneRef = useRef()
  const instance = useRef()
  const sphere = useRef()
  // The GLTF only contains a point-cloud and baked keyframes for the explosion
  const { scene: originalScene, animations } = useGLTF('/explosion.glb')
  const scene = useMemo(() => originalScene.clone(true), [originalScene])
  const { actions, mixer } = useAnimations(animations, sceneRef)
  const { drums, snare } = useStore((state) => state.audio)
  const track = useStore((state) => state.track)
  mixer.timeScale = 2
  // Can reset and play all actions
  const play = () =>
    Object.keys(actions).forEach((key) => {
      actions[key].setLoop(THREE.LoopOnce).stop().reset()
      actions[key].play()
    })
  // Control the sphere and the sparks
  useFrame(() => {
    if (drums.signal && track.kicks - 1 === beat && drums.gain) play((state.size = 1))
    if (snare.signal) state.size = 0
    sphere.current.scale.lerp(vec.set(state.size * drums.gain, state.size * drums.gain, state.size * drums.gain), 0.2)
    sphere.current.children[0].intensity = drums.avg * drums.gain * 10
    // This code transforms the empty GLTF nodes into a single drawcall via instancing
    sceneRef.current.children.forEach((node, i) => instance.current.setMatrixAt(i, node.matrix))
    instance.current.visible = !!drums.gain
    instance.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group {...props}>
      <mesh ref={sphere}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.95} />
        <pointLight color="red" distance={0.5} />
      </mesh>
      <group scale={[0.05, 0.05, 0.05]}>
        <primitive ref={sceneRef} object={scene} />
        <instancedMesh ref={instance} args={[null, null, originalScene.children.length]}>
          <circleGeometry args={[0.15, 0]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      </group>
    </group>
  )
}

function Graph(props) {
  const { synth } = useStore((state) => state.audio)
  const ref = useRef()
  useFrame(() => {
    for (let i = 0; i < 64; i++) {
      obj.position.set(i * 0.04, synth.data[i] / 1000, 0)
      obj.updateMatrix()
      ref.current.setMatrixAt(i, obj.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, 64]} {...props}>
      <planeGeometry args={[0.02, 0.05]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={1} />
    </instancedMesh>
  )
}

function DancingDot() {
  const { drums, snare } = useStore((state) => state.audio)
  const dot = useRef()
  useFrame((_) =>
    dot.current.rotation.set(Math.sin(_.clock.elapsedTime * 2) / 10 + (drums.avg * drums.gain) / 100, _.clock.elapsedTime + (snare.avg * snare.gain) / 100, 0),
  )
  return (
    <group ref={dot}>
      <mesh position={[-1, 0.25, 0]}>
        <sphereGeometry args={[0.03, 32, 32]} />
        <meshBasicMaterial toneMapped={false} color="black" />
      </mesh>
    </group>
  )
}

function Ground() {
  const [floor, normal] = useTexture(['/SurfaceImperfections003_1K_var1.jpg', '/SurfaceImperfections003_1K_Normal.jpg'])
  return (
    <Reflector position={[0, -0.225, 0]} resolution={512} args={[10, 10]} mirror={0.5} mixBlur={7} mixStrength={0.8} rotation={[-HPI, 0, HPI]} blur={[400, 50]}>
      {(Material, props) => <Material color="#858585" metalness={0.5} roughnessMap={floor} normalMap={normal} normalScale={[0.1, 0.1]} {...props} />}
    </Reflector>
  )
}

function Intro() {
  const clicked = useStore((state) => state.clicked)
  const api = useStore((state) => state.api)
  useEffect(() => api.loaded(), [])
  // Zoom in camera when user has pressed start
  return useFrame((state) => {
    if (clicked) {
      state.camera.position.lerp(vec.set(-2 + state.mouse.x, 2, 4.5), 0.05)
      state.camera.lookAt(0, 0, 0)
    }
  })
}

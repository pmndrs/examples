import * as THREE from "three"
import React, { Suspense, useEffect, useLayoutEffect, useCallback, useRef, useMemo, useState } from "react"
import { Canvas, useFrame, useThree, useLoader, createPortal } from "@react-three/fiber"
import { Physics, useSphere, useBox, usePlane } from "@react-three/cannon"
import { useAspect, OrthographicCamera, Sphere, Box, Plane, Text, Extrude } from "@react-three/drei"
import { a, useSpring } from "@react-spring/three"
import Effects from "./Effects"
import bgImg from "./resources/bg.jpg"
import { useStore } from "./store"

function useCollide(onColide) {
  const contact = useStore((state) => state.contact)
  const [{ impact }, set] = useSpring({ impact: 0 }, [])
  const event = useCallback((e) => {
    set({ impact: 10, config: { immediate: true } })
    requestAnimationFrame(() => set({ impact: 0 }))
    if (onColide) onColide(e)
    contact(e)
  }, [])
  return [impact, event]
}

function Paddle() {
  const { viewport } = useThree()
  const { width, height } = viewport
  const [impact, onCollide] = useCollide()
  const [ref, api] = useBox(() => ({ type: "Kinematic", args: [2.25, 0.75, 1], onCollide }))
  useFrame((state) => {
    api.position.set(state.mouse.x * (width / 2 + 2), -height / 2.5, 0)
    api.rotation.set(0, 0, (state.mouse.x * Math.PI) / 5)
  })
  return (
    <Box receiveShadow castShadow ref={ref} args={[2.25, 0.75, 1]}>
      <a.meshStandardMaterial color={impact.to([0, 1], ["lightblue", "white"])} />
    </Box>
  )
}

function Ball() {
  const [ref, api] = useSphere(() => ({ mass: 1, args: 0.4, position: [0, 3, 0], velocity: [0, 5, 0] }))
  const restart = useStore((state) => state.restart)
  useEffect(() => {
    if (restart) {
      api.position.set(0, 3, 0)
      api.velocity.set(0, 5, 0)
      api.angularVelocity.set(0, 0, 0)
    }
  }, [restart])
  return (
    <Sphere castShadow ref={ref} args={[0.4, 64, 64]}>
      <meshStandardMaterial />
    </Sphere>
  )
}

function Enemy({ long = false, right = false, y = 2, speed = 0.1, color = "hotpink" }) {
  const { viewport } = useThree()
  const { width } = viewport
  const [impact, onCollide] = useCollide()
  const [ref, api] = useBox(() => ({ type: "Static", args: [long ? 2.25 : 1.25, 0.75, 1], rotation: [0, 0, right ? 0.1 : -0.1], onCollide }))
  let initial = right ? width : -width
  let x = initial
  useFrame((state, delta) => {
    api.position.set((x = right ? x - speed : x + speed), y, 0)
    if (right ? x + 2 < -width / 2 : x - 2 > width / 2) x = initial
  })
  return (
    <Box receiveShadow castShadow ref={ref} args={[long ? 2.25 : 1.25, 0.75, 1]}>
      <a.meshStandardMaterial color={impact.to([0, 1], [color, "white"])} />
    </Box>
  )
}

function Enemies() {
  const enemies = useStore((state) => state.enemies)
  return enemies.map((props, i) => <Enemy key={i} {...props} />)
}

function Walls() {
  const reset = useStore((state) => state.reset)
  const { viewport } = useThree()
  const { width, height } = viewport
  const [, onCollide] = useCollide()
  const [, apiLeft] = usePlane(() => ({ type: "Static", rotation: [-Math.PI / 2, Math.PI / 2, 0], onCollide }))
  const [, apiRight] = usePlane(() => ({ type: "Static", rotation: [Math.PI / 2, -Math.PI / 2, 0], onCollide }))
  const [, apiBottom] = usePlane(() => ({ type: "Static", rotation: [-Math.PI / 2, 0, 0], onCollide: reset }))
  useLayoutEffect(() => {
    apiBottom.position.set(0, -height * 2, 0)
    apiLeft.position.set(-width / 2 - 2, 0, 0)
    apiRight.position.set(width / 2 + 2, 0, 0)
  }, [width, height])
  return null
}

function Bg() {
  const texture = useLoader(THREE.TextureLoader, bgImg)
  const scale = useAspect(1286, 574, 1.5)
  return <Plane scale={scale} material-map={texture} />
}

const StyledText = React.forwardRef(
  ({ children, fontSize = 1, offset = 0.25, anchorX = "center", anchorY = "middle", textAlign = "justify", lineHeight = 0.75, ...props }, ref) => {
    const { viewport } = useThree()
    const textProps = { children, anchorX, anchorY, maxWidth: viewport.width, lineHeight, fontSize, "material-depthTest": false }
    return (
      <group ref={ref} {...props}>
        <Text position-z={-offset} color="#ff3080" {...textProps} />
        <Text color="white" {...textProps} />
      </group>
    )
  },
)

function Startup() {
  const ref = useRef()
  useFrame((state) => {
    const s = 1 + 0.01 * (1 + Math.sin(state.clock.getElapsedTime() * 2)) * 2
    if (ref.current) ref.current.scale.set(s, s, s)
  })
  return <StyledText position={[0, 0.5, 1]} ref={ref} fontSize={1.5} children={"Click\nto start!"} />
}

function Heart(props) {
  const extrusionProps = useMemo(() => {
    const heartShape = new THREE.Shape()
    heartShape.moveTo(0.25, 0.25)
    heartShape.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0)
    heartShape.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35)
    heartShape.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95)
    heartShape.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35)
    heartShape.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0)
    heartShape.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25)
    return [heartShape, { depth: 0, bevelEnabled: false }]
  }, [])
  return (
    <group {...props}>
      <Extrude position={[0.125, 0.2, 0]} rotation={[0, 0, Math.PI]} scale={[0.5, 0.5, 0.5]} args={extrusionProps} material-color="hotpink" />
    </group>
  )
}

function Status() {
  const [virtualScene] = useState(() => new THREE.Scene())
  const virtualCamera = useRef()
  const points = useStore((state) => state.points)
  const { viewport } = useThree()
  const { width, height } = viewport.getCurrentViewport(virtualCamera.current)
  useFrame((state) => state.gl.render(virtualScene, virtualCamera.current), 2)
  return createPortal(
    <>
      <OrthographicCamera position={[0, 0, 10]} zoom={100} ref={virtualCamera} />
      <group position={[0, height / 2 - 1, 0]}>
        <StyledText position={[-width / 2 + 0.75, 0, 0]} fontSize={0.75} children={String(points)} anchorX="left" anchorY="middle" offset={0.1} />
        <Heart position={[width / 2 - 1, 0, 0]} />
        <Heart position={[width / 2 - 2, 0, 0]} />
        <Heart position={[width / 2 - 3, 0, 0]} />
      </group>
    </>,
    virtualScene,
  )
}

function Perspective() {
  return useFrame((state) => {
    state.camera.position.x = THREE.Math.lerp(state.camera.position.x, state.mouse.x * 2, 0.1)
    state.camera.updateProjectionMatrix()
  })
}

export default function App() {
  const startup = useStore((state) => state.startup)
  const start = useStore((state) => state.start)
  return (
    <div onClick={start}>
      <Canvas shadows gl={{ antialias: false, alpha: false }} dpr={0.25} camera={{ position: [0, 5, 12], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <directionalLight castShadow position={[10, 10, 5]} />
        <pointLight position={[-10, -10, -10]} />
        {!startup && (
          <Physics defaultContactMaterial={{ restitution: 1.07, contactEquationRelaxation: 10 }} gravity={[0, -30, 0]}>
            <Walls />
            <Ball />
            <Paddle />
            <Enemies />
          </Physics>
        )}
        <Status />
        {startup && <Startup />}
        <Suspense fallback={null}>
          <Bg />
        </Suspense>
        <Perspective />
        <Effects />
      </Canvas>
    </div>
  )
}

import * as THREE from 'three'
import { useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Mask, useMask, OrthographicCamera, Clone, Float as FloatImpl } from '@react-three/drei'
import useSpline from '@splinetool/r3f-spline'
import Embed from './Embed'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'

export function App() {
  const container = useRef()
  const domContent = useRef()
  return (
    <div ref={container} className="content-container">
      {/* Container for the HTML view */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }} ref={domContent} />
      {/* Container for THREEJS */}
      <Canvas
        shadows
        flat
        linear
        // Since the canvas will receive events from the out-most container it must ignore events
        // This will allow the HTML view underneath to receive events, too
        style={{ pointerEvents: 'none' }}
        // Re-connect r3f to a shared container, this allows both worlds (html & canvas) to receive events
        eventSource={container}
        // Re-define the event-compute function which now uses pageX/Y instead of offsetX/Y
        // Without this the right hand would reset to client 0/0 if it hovers over any of the HTML elements
        eventPrefix="page">
        <directionalLight castShadow intensity={0.4} position={[-10, 50, 300]} shadow-mapSize={[512, 512]} shadow-bias={-0.002}>
          <orthographicCamera attach="shadow-camera" args={[-2000, 2000, 2000, -2000, -10000, 10000]} />
        </directionalLight>
        <OrthographicCamera makeDefault={true} far={100000} near={-100000} position={[0, 0, 1000]} />
        <hemisphereLight intensity={0.5} color="#eaeaea" position={[0, 1, 0]} />
        <Scene portal={domContent} position={[0, -50, 0]} />
        <Test />
      </Canvas>
    </div>
  )
}

function Test() {
  const scene = useThree((state) => state.scene)
  const exporter = new GLTFExporter()

  // Parse the input and generate the glTF output
  exporter.parse(
    scene,
    // called when the gltf has been generated
    (gltf) => {
      console.log(JSON.stringify(gltf))

      /*var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(gltf))
      var dlAnchorElem = document.getElementById('downloadAnchorElem')
      dlAnchorElem.setAttribute('href', dataStr)
      dlAnchorElem.setAttribute('download', 'scene.json')
      dlAnchorElem.click()*/

      //downloadJSON(gltf)
    },
    {},
  )
}

function Scene({ portal, ...props }) {
  let timeout = null
  const v = new THREE.Vector3()
  const wheel = useRef(0)
  const hand = useRef()
  const [clicked, click] = useState(false)
  const { nodes, materials } = useSpline('scroll.splinecode')
  // Take the stencil and drop it over everything but the right hand
  const stencil = useMask(1, true)
  useLayoutEffect(() => {
    Object.values(nodes).forEach(
      (node) =>
        node.material &&
        node.parent.name !== 'hand-r' &&
        node.name !== 'Cube3' &&
        node.name !== 'Cube 8' &&
        node.name !== 'Cube 17' &&
        node.name !== 'Cube 24' &&
        Object.assign(node.material, stencil),
    )
  }, [])
  useFrame((state) => {
    v.copy({ x: state.pointer.x, y: state.pointer.y, z: 0 })
    v.unproject(state.camera)
    hand.current.rotation.x = THREE.MathUtils.lerp(hand.current.rotation.x, clicked ? -0.7 : -0.5, 0.2)
    hand.current.position.lerp({ x: v.x - 100, y: wheel.current + v.y, z: v.z }, 0.4)
    state.camera.zoom = THREE.MathUtils.lerp(state.camera.zoom, clicked ? 0.9 : 0.7, clicked ? 0.025 : 0.15)
    state.camera.position.lerp({ x: -state.pointer.x * 400, y: -state.pointer.y * 200, z: 1000 }, 0.1)
    state.camera.lookAt(0, 0, 0)
    state.camera.updateProjectionMatrix()
  })
  return (
    <group {...props} dispose={null}>
      <Float object={nodes['Bg-stuff']} />
      <Float object={nodes['Emoji-4']} />
      <Float object={nodes['Emoji-2']} />
      <Float object={nodes['Emoji-3']} />
      <Float object={nodes['Emoji-1']} />
      <Float object={nodes['Icon-text-2']} />
      <Float object={nodes['Icon-like']} />
      <Float object={nodes['Icon-star']} />
      <Float object={nodes['Icon-play']} />
      <Float object={nodes['Icon-text-1']} />
      <group ref={hand}>
        <Clone object={nodes['hand-r']} rotation-y={0.35} />
      </group>
      <Clone object={nodes['Bubble-BG']} scale={1.25} />
      <FloatImpl floatIntensity={100} rotationIntensity={0.5} speed={1}>
        <Float intensity={100} rotation={0.5} object={nodes['Bubble-LOGO']} position={[0, -0, 0]} scale={1.5} />
        <group position={[0, -50, 0]} rotation={[-0.15, 0, 0]}>
          <Clone object={nodes['hand-l']} position={[80, 100, -150]} />
          <group name="phone" position={[-50, 0, -68]}>
            <Clone object={[nodes['Rectangle 4'], nodes['Rectangle 3'], nodes['Boolean 2']]} />
            {/* Mask is a drei component that generates a stencil, we use the phone-screen as a mask, punching a hole into the canvas */}
            <Mask id={1} colorWrite={false} depthWrite={false} geometry={nodes.screen.geometry} castShadow receiveShadow position={[0, 0, 9.89]}>
              {/* We can drop the HTML inside, make it a 3d-transform and portal it to the dom container above */}
              <Html className="content-embed" portal={portal} scale={40} transform zIndexRange={[-1, 0]}>
                <Embed />
              </Html>
            </Mask>
            <mesh
              onWheel={(e) => {
                wheel.current = -e.deltaY / 2
                // Simple defer to reset wheel offset since the browser will never let delta be zero
                clearTimeout(timeout)
                timeout = setTimeout(() => (wheel.current = 0), 100)
              }}
              onPointerDown={(e) => {
                e.target.setPointerCapture(e.pointerId)
                click(true)
              }}
              onPointerUp={(e) => {
                e.target.releasePointerCapture(e.pointerId)
                click(false)
              }}
              receiveShadow
              geometry={nodes.screen.geometry}>
              <meshStandardMaterial transparent opacity={0.1} />
            </mesh>
          </group>
        </group>
      </FloatImpl>
    </group>
  )
}

const Float = ({ object, intensity = 300, rotation = 1, ...props }) => (
  <FloatImpl floatIntensity={intensity} rotationIntensity={rotation} speed={2}>
    <Clone object={object} {...props} />
  </FloatImpl>
)

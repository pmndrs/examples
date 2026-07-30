import { useEffect, useState } from 'react'
import { AudioLoader, Layers } from 'three'
import { Canvas, useLoader } from '@react-three/fiber'
import { Physics, Debug } from '@react-three/cannon'
import { Sky, Environment, PerspectiveCamera, OrthographicCamera, OrbitControls, Stats, useGLTF, useTexture, useEnvironment } from '@react-three/drei'

import type { DirectionalLight } from 'three'

import { HideMouse, Keyboard } from './controls'
import { Ramp, Track, Vehicle, Goal, Train, Heightmap } from './models'
import { angularVelocity, levelLayer, position, rotation, useStore } from './store'
import { Speed, Minimap, Intro, Help, Editor } from './ui'
import { useToggle } from './useToggle'
import { assetUrl } from './assetUrl'

const layers = new Layers()
layers.enable(levelLayer)

// Suspends on every asset the game needs, then flips the store's `loaded` flag.
// The Intro overlay keys off that flag rather than the Canvas suspending its
// parent Suspense boundary, which does not happen reliably.
//
// Each asset is loaded with a single-URL call so the cache keys match the ones
// the scene components use (array calls get their own, separate cache entry).
// The sounds mounting warm at the ready-flip also keeps drei's <PositionalAudio>
// correct: if they suspended there, the re-suspension would revert makeDefault
// to r3f's off-scene default camera right when the audio listeners attach to it.
function Loaded() {
  const set = useStore((s) => s.set)
  useGLTF(assetUrl('models/track-draco.glb'))
  useGLTF(assetUrl('models/chassis-draco.glb'))
  useGLTF(assetUrl('models/wheel-draco.glb'))
  useTexture(assetUrl('textures/heightmap_1024.png'))
  useTexture(assetUrl('textures/mask.svg'))
  useTexture(assetUrl('textures/cursor.svg'))
  useLoader(AudioLoader, assetUrl('sounds/engine.mp3'))
  useLoader(AudioLoader, assetUrl('sounds/boost.mp3'))
  useLoader(AudioLoader, assetUrl('sounds/accelerate.mp3'))
  useLoader(AudioLoader, assetUrl('sounds/honk.mp3'))
  useLoader(AudioLoader, assetUrl('sounds/tire-brake.mp3'))
  useLoader(AudioLoader, assetUrl('sounds/water.mp3'))
  useLoader(AudioLoader, assetUrl('sounds/train.mp3'))
  useLoader(AudioLoader, assetUrl('sounds/crash.mp3'))
  useEnvironment({ files: assetUrl('textures/dikhololo_night_1k.hdr') })
  useEffect(() => set({ loaded: true }), [])
  return null
}

export function App() {
  const [light, setLight] = useState<DirectionalLight | null>(null)
  const [actions, camera, dpr, editor, shadows] = useStore((s) => [s.actions, s.camera, s.dpr, s.editor, s.shadows])
  const { onFinish, onStart } = actions

  const ToggledDebug = useToggle(Debug, 'debug')
  const ToggledEditor = useToggle(Editor, 'editor')
  const ToggledMap = useToggle(Minimap, 'map')
  const ToggledOrbitControls = useToggle(OrbitControls, 'editor')
  const ToggledStats = useToggle(Stats, 'stats')

  return (
    <Intro>
      <Canvas key={`${dpr}${shadows}`} dpr={[1, dpr]} shadows={shadows} camera={{ position: [0, 5, 15], fov: 50 }}>
        <fog attach="fog" args={['white', 0, 500]} />
        <Sky sunPosition={[100, 10, 100]} distance={1000} />
        <ambientLight layers={layers} intensity={0.1 * Math.PI} />
        <directionalLight
          ref={setLight}
          layers={layers}
          position={[0, 50, 150]}
          intensity={Math.PI}
          shadow-bias={-0.001}
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-150}
          shadow-camera-right={150}
          shadow-camera-top={150}
          shadow-camera-bottom={-150}
          castShadow
        />
        <PerspectiveCamera makeDefault={editor} fov={75} position={[0, 20, 20]} />
        <Physics
          broadphase="SAP"
          defaultContactMaterial={{
            contactEquationRelaxation: 4,
            friction: 1e-3,
          }}
          allowSleep
        >
          <ToggledDebug scale={1.0001} color="white">
            <Vehicle angularVelocity={[...angularVelocity]} position={[...position]} rotation={[...rotation]}>
              {light && <primitive object={light.target} />}
              <PerspectiveCamera makeDefault={!editor && camera !== 'BIRD_EYE'} fov={75} rotation={[0, Math.PI, 0]} position={[0, 10, -20]} />
              <OrthographicCamera
                makeDefault={!editor && camera === 'BIRD_EYE'}
                near={-1000}
                far={1000}
                position={[0, 100, 0]}
                rotation={[(-1 * Math.PI) / 2, 0, Math.PI]}
                zoom={15}
              />
            </Vehicle>
            <Train />
            <Ramp args={[30, 6, 8]} position={[2, -1, 168.55]} rotation={[0, 0.49, Math.PI / 15]} />
            <Heightmap elementSize={0.5085} position={[327 - 66.5, -3.3, -473 + 213]} rotation={[-Math.PI / 2, 0, -Math.PI]} />
            <Goal args={[0.001, 10, 18]} onCollideBegin={onStart} rotation={[0, 0.55, 0]} position={[-27, 1, 180]} />
            <Goal args={[0.001, 10, 18]} onCollideBegin={onFinish} rotation={[0, -1.2, 0]} position={[-104, 1, -189]} />
          </ToggledDebug>
        </Physics>
        <Track />
        <Loaded />
        <Environment files={assetUrl('textures/dikhololo_night_1k.hdr')} />
        <ToggledMap />
        <ToggledOrbitControls />
      </Canvas>
      <ToggledEditor />
      <Help />
      <Speed />
      <ToggledStats />
      <HideMouse />
      <Keyboard />
    </Intro>
  )
}

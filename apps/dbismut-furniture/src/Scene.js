import * as THREE from 'three'
import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, createPortal, useThree } from '@react-three/fiber'
import { PerspectiveCamera, ScreenQuad, useGLTF, useFBO } from '@react-three/drei'
import { a, useSprings } from '@react-spring/three'
import { CrossFadeMaterial } from './XFadeMaterial'

const transitions = {
  from: { rotation: [0, -Math.PI / 10, 0], scale: [0.8, 0.8, 0.8] },
  enter: { rotation: [0, 0, 0], scale: [1, 1, 1] },
  leave: { rotation: [0, Math.PI / 10, 0], scale: [0.8, 0.8, 0.8] },
}

const sceneStyle = { width: '100vw', height: '56vw' }
const enter = transitions.enter
const leave = transitions.leave

function Model({ model, ...props }) {
  const ref = useRef()
  const [rEuler, rQuaternion] = useMemo(() => [new THREE.Euler(), new THREE.Quaternion()], [])
  useFrame((state) => {
    rEuler.set(0, (state.mouse.x * Math.PI) / 150, (-state.mouse.y * Math.PI) / 150)
    ref.current.quaternion.slerp(rQuaternion.setFromEuler(rEuler), 0.1)
  })
  return (
    <group ref={ref}>
      <spotLight intensity={0.7} position={[8, 6, -4]} penumbra={0} />
      <a.primitive {...props} object={model.scene} />
    </group>
  )
}

function RenderScene({ target, model, camRef, ...props }) {
  const scene = useMemo(() => new THREE.Scene(), [])
  useFrame((state) => {
    state.gl.setRenderTarget(target)
    state.gl.render(scene, camRef.current)
  }, 0)
  return createPortal(<Model model={model} {...props} />, scene)
}

function Models({ shownIndex, models }) {
  const _models = useGLTF(models)
  const [idxesInScenes] = useState([shownIndex, (shownIndex + 1) % models.length])
  const hiddenTxt = useRef(1)
  const shownTxt = useMemo(() => {
    if (idxesInScenes.indexOf(shownIndex) < 0) idxesInScenes[hiddenTxt.current] = shownIndex
    const idx = idxesInScenes.indexOf(shownIndex)
    hiddenTxt.current = idx ? 0 : 1
    return idx
  }, [shownIndex, idxesInScenes])

  const t0 = useFBO({ stencilBuffer: false, multisample: true })
  const t1 = useFBO({ stencilBuffer: false, multisample: true })
  const targets = [t0, t1]
  const camRef = useRef(null)

  useFrame((state) => {
    state.gl.setRenderTarget(null)
    state.gl.render(state.scene, state.camera)
  }, 1)

  const [springs, api] = useSprings(2, (i) => transitions[i === 0 ? 'enter' : 'from'])
  const regress = useThree((state) => state.performance.regress)

  useEffect(() => {
    api.start((i) => {
      const isEntering = i === shownTxt
      const t = isEntering ? enter : leave
      return { ...t, onChange: () => regress() }
    })
  }, [api, shownTxt, regress])

  return (
    <>
      <PerspectiveCamera ref={camRef} position={[-2.71, 1.34, 1.8]} rotation={[-0.74, -1.14, -0.7]} far={9} fov={37.1} />
      <ScreenQuad>
        <CrossFadeMaterial attach="material" texture1={t0.texture} texture2={t1.texture} shownTxt={shownTxt} />
      </ScreenQuad>
      {springs.map((props, i) => (
        <RenderScene key={i} target={targets[i]} model={_models[idxesInScenes[i]]} camRef={camRef} {...props} />
      ))}
    </>
  )
}

export function Scene({ models, shownIndex = 0, target }) {
  return (
    <Canvas orthographic gl={{ antialias: false }} eventSource={target.current} style={sceneStyle}>
      <Models shownIndex={shownIndex} models={models} />
    </Canvas>
  )
}

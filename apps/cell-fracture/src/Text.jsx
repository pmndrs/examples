import * as THREE from 'three'
import { useRef, useEffect, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'

import helloFragmentsModel from './hello-fragments.glb'
import helloTextModel from './hello-text.glb'

const normalMaterial = new THREE.MeshNormalMaterial()

export function Fragments({ visible, ...props }) {
  const group = useRef()
  const { scene, animations, materials } = useGLTF(helloFragmentsModel)
  const { actions } = useAnimations(animations, group)
  // Exchange inner material
  useMemo(() => scene.traverse((o) => o.type === 'Mesh' && o.material === materials.inner && (o.material = normalMaterial)), [])
  // Play actions
  useEffect(() => {
    if (visible)
      Object.keys(actions).forEach((key) => {
        actions[key].repetitions = 0
        actions[key].clampWhenFinished = true
        actions[key].play()
      })
  }, [visible])
  return <primitive ref={group} object={scene} {...props} />
}

export function Model(props) {
  const { scene } = useGLTF(helloTextModel)
  return <primitive object={scene} {...props} />
}

useGLTF.preload(helloFragmentsModel)
useGLTF.preload(helloTextModel)

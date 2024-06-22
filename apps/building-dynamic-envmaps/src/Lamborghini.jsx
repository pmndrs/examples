import * as THREE from 'three'
import { useMemo } from 'react'
import { applyProps } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

/*
Author: Steven Grey (https://sketchfab.com/Steven007)
License: CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)
Source: https://sketchfab.com/3d-models/lamborghini-urus-2650599973b649ddb4460ff6c03e4aa2
Title: Lamborghini Urus
*/
export function Lamborghini(props) {
  const { scene, nodes, materials } = useGLTF('/lambo.glb')
  useMemo(() => {
    // ⬇⬇⬇ All this is probably better fixed in Blender ...
    Object.values(nodes).forEach((node) => {
      if (node.isMesh) {
        // Fix glas, normals look messed up in the original, most likely deformed meshes bc of compression :/
        if (node.name.startsWith('glass')) node.geometry.computeVertexNormals()
        // Fix logo, too dark
        if (node.name === 'silver_001_BreakDiscs_0') node.material = applyProps(materials.BreakDiscs.clone(), { color: '#ddd' })
      }
    })
    // Fix windows, they have to be inset some more
    nodes['glass_003'].scale.setScalar(2.7)
    // Fix inner frame, too light
    applyProps(materials.FrameBlack, { metalness: 0.75, roughness: 0, color: 'black' })
    // Wheels, change color from chrome to black matte
    applyProps(materials.Chrome, { metalness: 1, roughness: 0, color: '#333' })
    applyProps(materials.BreakDiscs, { metalness: 0.2, roughness: 0.2, color: '#555' })
    applyProps(materials.TiresGum, { metalness: 0, roughness: 0.4, color: '#181818' })
    applyProps(materials.GreyElements, { metalness: 0, color: '#292929' })
    // Make front and tail LEDs emit light
    applyProps(materials.emitbrake, { emissiveIntensity: 3, toneMapped: false })
    applyProps(materials.LightsFrontLed, { emissiveIntensity: 3, toneMapped: false })
    // Paint, from yellow to black
    nodes.yellow_WhiteCar_0.material = new THREE.MeshPhysicalMaterial({
      roughness: 0.3,
      metalness: 0.05,
      color: '#111',
      envMapIntensity: 0.75,
      clearcoatRoughness: 0,
      clearcoat: 1
    })
  }, [nodes, materials])
  return <primitive object={scene} {...props} />
}

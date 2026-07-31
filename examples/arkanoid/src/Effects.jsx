import React, { useRef, useEffect } from "react"
import { extend, useThree, useFrame } from "@react-three/fiber"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass"
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass"
import { ColorCorrectionShader } from "three/examples/jsm/shaders/ColorCorrectionShader"

extend({ EffectComposer, ShaderPass, RenderPass, UnrealBloomPass, FilmPass })

export default function Effects() {
  const composer = useRef()
  const { scene, gl, size, camera } = useThree()
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  useFrame(() => {
    gl.autoClear = true
    composer.current.render()
    gl.autoClear = false
    gl.clearDepth()
  }, 1)
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <unrealBloomPass attachArray="passes" args={[undefined, 1.4, 1, 0.55]} />
      <filmPass attachArray="passes" args={[0, 1, 1000, false]} />
      <shaderPass args={[ColorCorrectionShader]} />
    </effectComposer>
  )
}

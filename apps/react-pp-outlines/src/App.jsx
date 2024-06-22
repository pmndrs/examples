import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Bounds, GizmoHelper, GizmoViewport, Lightformer, Environment, ArcballControls } from "@react-three/drei"
import { EffectComposer, SSAO, SMAA, Selection, Outline } from "@react-three/postprocessing"
import { Engine } from "./Engine"

export default function App() {
  return (
    <Canvas orthographic dpr={[1, 2]} camera={{ position: [0, 0, 100], fov: 35, near: 1, far: 20 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.75} />

        <Selection>
          <EffectComposer multisampling={0} autoClear={false}>
            <SSAO radius={0.05} intensity={150} luminanceInfluence={0.5} color="black" />
            <Outline visibleEdgeColor="white" hiddenEdgeColor="white" blur width={1000} edgeStrength={100} />
            <SMAA />
          </EffectComposer>
          <Bounds fit clip margin={1.2} damping={0}>
            <Engine rotation={[Math.PI / 2, 0, 0]} />
          </Bounds>
        </Selection>

        <Environment resolution={256}>
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            {[2, 0, 2, 0, 2, 0, 2, 0].map((x, i) => (
              <Lightformer key={i} form="circle" intensity={4} rotation={[Math.PI / 2, 0, 0]} position={[x, 4, i * 4]} scale={[4, 1, 1]} />
            ))}
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[50, 2, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[50, 2, 1]} />
            <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[50, 2, 1]} />
          </group>
        </Environment>
      </Suspense>

      <GizmoHelper alignment="bottom-right" margin={[80, 80]} renderPriority={2}>
        <GizmoViewport axisColors={["hotpink", "aquamarine", "#3498DB"]} labelColor="black" />
      </GizmoHelper>

      <ArcballControls enableZoom={false} enablePan={false} makeDefault />
    </Canvas>
  )
}

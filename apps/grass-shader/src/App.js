import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Sky, OrbitControls } from "@react-three/drei"
import Grass from "./Grass"

export default function App() {
  return (
    <Canvas camera={{ position: [15, 15, 10] }}>
      <Sky azimuth={1} inclination={0.6} distance={1000} />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <Grass />
      </Suspense>
      <OrbitControls minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2.5} />
    </Canvas>
  )
}

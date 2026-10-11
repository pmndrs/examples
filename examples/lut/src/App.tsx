import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, LUT } from "@react-three/postprocessing";
import { useControls } from "leva";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo } from "react";
import { Island } from "./Island";
import { createLUTs, GRADES, type Grade } from "./luts";
import { HORIZON, SUN_DIRECTION, Surroundings } from "./Surroundings";

function Effects() {
  const { grade, opacity } = useControls("Postprocessing - LUT", {
    grade: {
      value: "Teal & orange" as Grade,
      options: Object.keys(GRADES) as Grade[],
    },
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
  });

  const luts = useMemo(createLUTs, []);
  useEffect(
    () => () => Object.values(luts).forEach((lut) => lut.dispose()),
    [luts],
  );

  return (
    <EffectComposer>
      {/* NORMAL, since the default SRC ignores opacity. */}
      <LUT
        lut={luts[grade]}
        blendFunction={BlendFunction.NORMAL}
        opacity={opacity}
      />
    </EffectComposer>
  );
}

export default function App() {
  const sun = SUN_DIRECTION.clone().multiplyScalar(60);

  return (
    <Canvas shadows camera={{ position: [24, 11, 24], fov: 40 }}>
      <fog attach="fog" args={[HORIZON, 45, 120]} />
      <hemisphereLight args={["#9db7e8", "#4a3b2a", 0.5 * Math.PI]} />
      <directionalLight
        position={sun}
        intensity={2 * Math.PI}
        color="#ffb36b"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-22, 22, 22, -22, 20, 110]}
        />
      </directionalLight>

      <Surroundings />
      <Island />
      <Effects />

      <OrbitControls
        target={[0, 1.5, 0]}
        autoRotate
        autoRotateSpeed={0.3}
        enablePan={false}
        minDistance={15}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.15}
      />
    </Canvas>
  );
}

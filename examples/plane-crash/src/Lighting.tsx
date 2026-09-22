import { Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { easing } from "maath";
import { useRef } from "react";
import { PulsingPointLight } from "./PulsingPointLight";
import { TargetedSpotLight } from "./TargetedSpotLight";

export function Lighting() {
  const { isDay } = useControls("Lighting", {
    isDay: { value: true, label: "Is day?" },
  });

  const scene = useThree((state) => state.scene);
  const values = useRef({ env: 1.5, background: 1 });

  useFrame((_, delta) => {
    const target = isDay
      ? { env: 1.5, background: 1 }
      : { env: 0.02, background: 0.001 };

    easing.damp(values.current, "env", target.env, 0.4, delta);
    easing.damp(values.current, "background", target.background, 0.4, delta);

    scene.environmentIntensity = values.current.env;
    scene.backgroundIntensity = values.current.background;
  });

  return (
    <>
      <TargetedSpotLight
        intensity={isDay ? 0 : 6}
        color={0xfffce6}
        position={[3, 3.8, 13]}
        target={[2.4, 4.5, 14]}
      />
      <TargetedSpotLight
        intensity={isDay ? 0 : 6}
        color={0xfffce6}
        position={[5.2, 3.8, 14.6]}
        target={[4.6, 4.5, 15.6]}
      />
      <PulsingPointLight
        enabled={!isDay}
        position={[-1.7, 1, -7]}
        color="red"
        speed={3}
      />

      <Environment
        preset="sunset"
        background
        blur={0.5}
        frames={1}
        environmentIntensity={1.5}
        backgroundIntensity={1}
        backgroundRotation={[0, -Math.PI / 1.3, 0]}
      />
    </>
  );
}

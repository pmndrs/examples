import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { PointLight } from "three";

type Props = {
  position?: [number, number, number];
  color?: string;
  baseIntensity?: number;
  pulseIntensity?: number;
  speed?: number;
  enabled?: boolean;
};

export function PulsingPointLight({
  position = [0, 0, 0],
  color = "white",
  baseIntensity = 1,
  pulseIntensity = 0.5,
  speed = 1,
  enabled = true,
}: Props) {
  const lightRef = useRef<PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;

    lightRef.current.intensity = enabled
      ? baseIntensity +
        Math.sin(clock.getElapsedTime() * speed) * pulseIntensity
      : 0;
  });

  return (
    <pointLight
      ref={lightRef}
      decay={2}
      position={position}
      color={color}
      intensity={baseIntensity}
    />
  );
}

import { useTexture } from "@react-three/drei";
import { BackSide } from "three";
import skyUrl from "./digital_painting_golden_hour_sunset.jpg?url";

export function SkyBox() {
  const texture = useTexture(skyUrl);

  return (
    <mesh userData={{ lensflare: "no-occlusion" }} scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 60, 40]} />
      <meshBasicMaterial toneMapped={false} map={texture} side={BackSide} />
    </mesh>
  );
}

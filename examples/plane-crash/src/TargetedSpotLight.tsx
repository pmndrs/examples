import { useEffect, useRef } from "react";
import { Object3D, SpotLight } from "three";

type Props = {
  position?: [number, number, number];
  target?: [number, number, number];
  intensity?: number;
  color?: string | number;
  angle?: number;
  penumbra?: number;
};

export function TargetedSpotLight({
  position = [0, 5, 0],
  target = [0, 0, 0],
  intensity = 1,
  color = "white",
  angle = Math.PI / 3.8,
  penumbra = 0.5,
}: Props) {
  const lightRef = useRef<SpotLight>(null);
  const targetRef = useRef<Object3D>(null);

  useEffect(() => {
    if (!lightRef.current || !targetRef.current) return;
    lightRef.current.target = targetRef.current;
    lightRef.current.target.updateMatrixWorld();
  }, [target]);

  return (
    <>
      <spotLight
        ref={lightRef}
        position={position}
        intensity={intensity}
        color={color}
        angle={angle}
        penumbra={penumbra}
        castShadow
      />
      <object3D ref={targetRef} position={target} />
    </>
  );
}

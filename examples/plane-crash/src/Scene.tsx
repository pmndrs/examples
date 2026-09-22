import { Sparkles, useProgress } from "@react-three/drei";
import { degToRad } from "maath/misc";
import { useEffect, useRef } from "react";
import { Crow } from "./Crow";
import { Plane } from "./Plane";

export function Scene({ onLoaded }: { onLoaded: () => void }) {
  const { active } = useProgress();
  const initialized = useRef(false);

  useEffect(() => {
    if (!active && !initialized.current) {
      onLoaded?.();
      initialized.current = true;
    }
  }, [active, onLoaded]);

  return (
    <group>
      <Crow position={[1.5, 6.23, 14]} rotation={[0, degToRad(-20), 0]} />
      <Crow position={[-0.648, 1.69, 2]} rotation={[0, degToRad(110), 0]} />
      <Sparkles
        count={50}
        scale={[10, 4, 10]}
        size={1}
        speed={1}
        position={[0, 2, 0]}
      />
      <Plane />
    </group>
  );
}

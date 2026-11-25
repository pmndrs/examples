import { InputController } from "@pmndrs/klipp/react";

const orbitSource = { axes: { x: "horizontal", y: "vertical" }, gain: 0.3 };

export function OrbitInput() {
  return (
    <InputController
      mouseButtons={{ left: orbitSource }}
      touches={{ one: orbitSource }}
      wheel={{ axis: "radial", gain: 0.001, invert: true }}
      pinch={{ axis: "radial", invert: true }}
      blendThreshold={0}
      suppressContextMenu
    />
  );
}

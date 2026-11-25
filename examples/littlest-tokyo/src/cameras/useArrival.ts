import type { SplineDollyBodyThree } from "@pmndrs/klipp/three";
import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";

// Close enough to the end of its way, in knots, for the next shot to take over without it showing.
const arriveWithin = 0.02;

/** While `waiting`, calls `onArrive` once the damped dolly has caught up with where it heads. */
export function useArrival(
  dolly: RefObject<SplineDollyBodyThree | null>,
  waiting: boolean,
  onArrive: () => void,
): void {
  useFrame(() => {
    if (waiting && dolly.current && dolly.current.remaining() < arriveWithin)
      onArrive();
  });
}

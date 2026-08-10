import type { ThreeElement } from "@react-three/fiber";

// @react-three/flex is still typed against react-three-fiber v8, whose
// `ReactThreeFiber.Object3DNode` helper no longer exists in v9. Re-declaring it
// here makes the `<Flex />` / `<Box />` prop types resolve again.
declare module "@react-three/fiber" {
  namespace ReactThreeFiber {
    type Object3DNode<T, C> = ThreeElement<
      C extends new (...args: never[]) => T ? C : new () => T
    >;
  }
}

import * as THREE from "three";
import {
  createContext,
  useMemo,
  useRef,
  useState,
  useContext,
  useLayoutEffect,
  forwardRef,
  useEffect,
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";
import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { QuadraticBezierLine, Text } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import { type Line2 } from "three-stdlib";

type CircleProps = ThreeElements["mesh"] & {
  opacity?: number;
  radius?: number;
  segments?: number;
  color?: string;
};

const Circle = forwardRef<THREE.Mesh, CircleProps>(
  (
    {
      children,
      opacity = 1,
      radius = 0.05,
      segments = 32,
      color = "#ff1050",
      ...props
    },
    ref,
  ) => (
    <mesh ref={ref} {...props}>
      <circleGeometry args={[radius, segments]} />
      <meshBasicMaterial
        transparent={opacity < 1}
        opacity={opacity}
        color={color}
      />
      {children}
    </mesh>
  ),
);

type NodeState = {
  position: THREE.Vector3;
  connectedTo: RefObject<THREE.Mesh | null>[];
};

const context = createContext<Dispatch<SetStateAction<NodeState[]>>>(null!);

export function Nodes({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const [nodes, set] = useState<NodeState[]>([]);
  const lines = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let node of nodes)
      node.connectedTo
        .map((ref) => [node.position, ref.current!.position])
        .forEach(([start, end]) =>
          lines.push({
            start: start.clone().add({ x: 0.35, y: 0, z: 0 }),
            end: end.clone().add({ x: -0.35, y: 0, z: 0 }),
          }),
        );
    return lines;
  }, [nodes]);
  useFrame((_, delta) =>
    group.current.children.forEach(
      (group) =>
        ((group.children[0] as Line2).material.uniforms.dashOffset.value -=
          delta * 10),
    ),
  );
  return (
    <context.Provider value={set}>
      <group ref={group}>
        {lines.map((line, index) => (
          <group>
            <QuadraticBezierLine
              key={index}
              {...line}
              color="white"
              dashed
              dashScale={50}
              gapSize={20}
            />
            <QuadraticBezierLine
              key={index}
              {...line}
              color="white"
              lineWidth={0.5}
              transparent
              opacity={0.1}
            />
          </group>
        ))}
      </group>
      {children}
      {lines.map(({ start, end }, index) => (
        <group key={index} position-z={1}>
          <Circle position={start} />
          <Circle position={end} />
        </group>
      ))}
    </context.Provider>
  );
}

type NodeProps = Omit<ThreeElements["mesh"], "position"> & {
  name: string;
  color?: string;
  connectedTo?: RefObject<THREE.Mesh | null>[];
  position?: [number, number, number];
};

export const Node = forwardRef<THREE.Mesh, NodeProps>(
  (
    { color = "black", name, connectedTo = [], position = [0, 0, 0], ...props },
    ref,
  ) => {
    const set = useContext(context);
    const { size, camera } = useThree();
    const [pos, setPos] = useState(() => new THREE.Vector3(...position));
    const state = useMemo(
      () => ({ position: pos, connectedTo }),
      [pos, connectedTo],
    );
    // Register this node on mount, unregister on unmount
    useLayoutEffect(() => {
      set((nodes) => [...nodes, state]);
      return () => void set((nodes) => nodes.filter((n) => n !== state));
    }, [state, pos]);
    // Drag n drop, hover
    const [hovered, setHovered] = useState(false);
    useEffect(
      () => void (document.body.style.cursor = hovered ? "grab" : "auto"),
      [hovered],
    );
    const bind = useDrag(({ down, xy: [x, y] }) => {
      document.body.style.cursor = down ? "grabbing" : "grab";
      setPos(
        new THREE.Vector3(
          (x / size.width) * 2 - 1,
          -(y / size.height) * 2 + 1,
          0,
        )
          .unproject(camera)
          .multiply({ x: 1, y: 1, z: 0 })
          .clone(),
      );
    });
    return (
      <Circle
        ref={ref}
        {...bind()}
        opacity={0.2}
        radius={0.5}
        color={color}
        position={pos}
        {...props}
      >
        <Circle
          radius={0.25}
          position={[0, 0, 0.1]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          color={hovered ? "#ff1050" : color}
        >
          <Text position={[0, 0, 1]} fontSize={0.25}>
            {name}
          </Text>
        </Circle>
      </Circle>
    );
  },
);

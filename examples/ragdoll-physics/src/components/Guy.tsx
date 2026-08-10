import { createContext, useContext, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useBox, useConeTwistConstraint } from "@react-three/cannon";
import type { BoxProps, ConeTwistConstraintOpts } from "@react-three/cannon";
import type { Group, Mesh, Object3D } from "three";
import { createRagdoll } from "../helpers/createRagdoll";
import { useDragConstraint } from "../helpers/Drag";
import { Block } from "../helpers/Block";

const { shapes, joints } = createRagdoll(5.5, Math.PI / 16, Math.PI / 16, 0);
const context = createContext<RefObject<Object3D | null> | undefined>(
  undefined,
);

type TransformProps = Pick<BoxProps, "position" | "rotation">;

type BodyPartProps = TransformProps & {
  config?: ConeTwistConstraintOpts;
  children?: ReactNode;
  render?: ReactNode;
  name: keyof typeof shapes;
};

const BodyPart = ({
  config = {},
  children,
  render,
  name,
  ...props
}: BodyPartProps) => {
  const { color, args, mass, position } = shapes[name];
  const parent = useContext(context);
  const [ref] = useBox<Mesh>(() => ({
    mass,
    args,
    position,
    linearDamping: 0.99,
    ...props,
  }));
  useConeTwistConstraint(ref, parent, config);
  const bind = useDragConstraint(ref);
  return (
    <context.Provider value={ref}>
      <Block
        castShadow
        receiveShadow
        ref={ref}
        {...props}
        {...bind}
        scale={args}
        name={name}
        color={color}
      >
        {render}
      </Block>
      {children}
    </context.Provider>
  );
};

function Face() {
  const mouth = useRef<Mesh>(null!);
  const eyes = useRef<Group>(null!);
  useFrame((state) => {
    eyes.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    mouth.current.scale.y = (1 + Math.sin(state.clock.elapsedTime * 2)) * 0.6;
  });
  return (
    <>
      <group ref={eyes}>
        <Block
          position={[-0.3, 0.1, 0.5]}
          args={[0.2, 0.1, 0.1]}
          color="black"
          transparent
          opacity={0.8}
        />
        <Block
          position={[0.3, 0.1, 0.5]}
          args={[0.2, 0.1, 0.1]}
          color="black"
          transparent
          opacity={0.8}
        />
      </group>
      <Block
        ref={mouth}
        position={[0, -0.2, 0.5]}
        args={[0.3, 0.05, 0.1]}
        color="#700000"
        transparent
        opacity={0.8}
      />
    </>
  );
}

export function Guy(props: TransformProps) {
  return (
    <BodyPart name="upperBody" {...props}>
      <BodyPart
        {...props}
        name="head"
        config={joints["neckJoint"]}
        render={<Face />}
      />
      <BodyPart {...props} name="upperLeftArm" config={joints["leftShoulder"]}>
        <BodyPart
          {...props}
          name="lowerLeftArm"
          config={joints["leftElbowJoint"]}
        />
      </BodyPart>
      <BodyPart
        {...props}
        name="upperRightArm"
        config={joints["rightShoulder"]}
      >
        <BodyPart
          {...props}
          name="lowerRightArm"
          config={joints["rightElbowJoint"]}
        />
      </BodyPart>
      <BodyPart {...props} name="pelvis" config={joints["spineJoint"]}>
        <BodyPart
          {...props}
          name="upperLeftLeg"
          config={joints["leftHipJoint"]}
        >
          <BodyPart
            {...props}
            name="lowerLeftLeg"
            config={joints["leftKneeJoint"]}
          />
        </BodyPart>
        <BodyPart
          {...props}
          name="upperRightLeg"
          config={joints["rightHipJoint"]}
        >
          <BodyPart
            {...props}
            name="lowerRightLeg"
            config={joints["rightKneeJoint"]}
          />
        </BodyPart>
      </BodyPart>
    </BodyPart>
  );
}

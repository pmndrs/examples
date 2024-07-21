import React, { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";

globalThis.Math.random = () => 0.2;

function SayCheese({ timestamp = 30 }) {
  const { advance, setFrameloop, invalidate, internal } = useThree();
  window.advance = advance;

  useEffect(() => {
    console.log("Say cheese!");

    setTimeout(() => {
      console.log("timeout");
      // internal.active = false

      setFrameloop("never");
      advance(0);
      invalidate();

      document.dispatchEvent(new Event("playright:r3f"));
    }, 3000);
  }, []);

  return null;
}

export default function ({ children, ...props }) {
  useEffect(() => {
    console.log("Custom canvas effect!");
  }, []);

  const props2 = {
    ...props,
    style: { border: "2px solid red", ...props.style },
  };

  const sayCheeseParam = new URLSearchParams(window.location.search).has(
    "saycheese"
  );

  return (
    <Canvas {...props2}>
      {sayCheeseParam && <SayCheese />}

      {children}
    </Canvas>
  );
}

import React, { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";

function SayCheese({ timestamp = 30 }) {
  const { advance, setFrameloop, invalidate, internal } = useThree();
  window.advance = advance;

  useEffect(() => {
    console.log(`Now say 😬cheeese (photo in ${timestamp} secs)`);

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
    console.log("CheesyCanvas: use ?saycheese in the URL");
  }, []);

  const props2 = {
    ...props,
    // style: { border: "2px solid red", ...props.style },
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

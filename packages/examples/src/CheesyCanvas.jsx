import React, { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";

function SayCheese({ pauseAt = 0 }) {
  const { advance, setFrameloop, clock } = useThree();

  useEffect(() => {
    console.log(`😬 Say cheeese (shooting photo in ${pauseAt}ms)`);

    function shoot() {
      // const secs = clock.elapsedTime;
      const secs = 0;
      console.log("📸 Shooting", secs);

      setFrameloop("never");
      advance(secs);
      advance(secs); // not exactly sure why, but needed 🤷‍♂️

      document.dispatchEvent(new Event("playright:r3f")); // will tell Playright to take a screenshot
    }

    setTimeout(shoot, pauseAt);

    return () => {
      clearTimeout(shoot);
    };
  }, []);

  return null;
}

export default function CheesyCanvas({ children, ...props }) {
  useEffect(() => {
    console.log(
      "CheesyCanvas: use ?saycheese in the URL to stop the animation"
    );
  }, []);

  const sayCheeseParam = new URLSearchParams(window.location.search).has(
    "saycheese"
  );

  return (
    <Canvas {...props}>
      {sayCheeseParam && <SayCheese pauseAt={3000} />}

      {children}
    </Canvas>
  );
}

import React from "react";
import { useReflow } from "@react-three/flex";
import { Text as DreiText } from "@react-three/drei";

// The fonts live in this example's public/ folder; BASE_URL makes the path work under the site's per-example base path.
const baseUrl = import.meta.env.BASE_URL.replace(/\/?$/, "/");

export default function Text({
  bold = false,
  anchorX = "left",
  anchorY = "top",
  textAlign = "left",
  ...props
}) {
  const reflow = useReflow();
  const font = baseUrl + (bold ? "Inter-Bold.woff" : "Inter-Regular.woff");
  return (
    <DreiText
      anchorX={anchorX}
      anchorY={anchorY}
      textAlign={textAlign}
      font={font}
      onSync={reflow}
      {...props}
    />
  );
}

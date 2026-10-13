import { Canvas } from "@react-three/fiber/webgpu";
import CheesyCanvas from "./CheesyCanvas";

export default function CheesyWebGPUCanvas(props) {
  return <CheesyCanvas {...props} CanvasComponent={Canvas} />;
}

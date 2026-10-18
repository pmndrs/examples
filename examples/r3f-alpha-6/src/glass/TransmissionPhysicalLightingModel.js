import { PhysicalLightingModel } from "three/webgpu";
import { diffuseColor, mix, transmission } from "three/tsl";

export default class TransmissionPhysicalLightingModel extends PhysicalLightingModel {
  constructor(
    clearcoat,
    sheen,
    iridescence,
    anisotropy,
    useCustomTransmission,
    backdropNode,
  ) {
    super(clearcoat, sheen, iridescence, anisotropy, false, false);
    this.useCustomTransmission = useCustomTransmission;
    this.backdropNode = backdropNode;
  }

  start(builder) {
    if (this.backdropNode !== null) {
      const context = builder.context;
      context.backdrop = this.backdropNode;
      context.backdropAlpha = transmission;
      diffuseColor.a.mulAssign(mix(1, context.backdrop.a, transmission));
    }

    super.start(builder);
  }
}

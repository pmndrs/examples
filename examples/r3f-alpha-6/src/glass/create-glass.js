// Adapted from Anderson Mancini's webgpu-glass-drei. See ../CREDITS.md.
import * as THREE from "three/webgpu";
import { uniform } from "three/tsl";
import { buildTransmissionBackdropNode } from "./transmissionNodes";
import {
  getTransmissionBackdropTextureNode,
  registerTransmissionGlassMaterial,
  unregisterTransmissionGlassMaterial,
} from "./transmissionBackdrop";
import TransmissionPhysicalLightingModel from "./TransmissionPhysicalLightingModel";

class GlassPhysicalNodeMaterial extends THREE.MeshPhysicalNodeMaterial {
  setupLightingModel() {
    return new TransmissionPhysicalLightingModel(
      this.useClearcoat,
      this.useSheen,
      this.useIridescence,
      this.useAnisotropy,
      this.useTransmission,
      this.transmissionBackdropNode,
    );
  }
}

/** All letters and shards share one material and one backdrop capture. */
export function createGlass(renderer, scene, camera) {
  const params = {
    ior: uniform(1.5),
    thickness: uniform(0.9),
    backsideThickness: uniform(0.35),
    anisotropicBlur: uniform(0.05),
    distortion: uniform(0.04),
    distortionScale: uniform(0.018),
    temporalDistortion: uniform(0),
    attenuationDistance: uniform(0),
    attenuationColor: uniform(new THREE.Color("#ffffff")),
    time: uniform(0),
  };
  const material = new GlassPhysicalNodeMaterial({
    color: "#ffffff",
    roughness: 0.012,
    metalness: 0,
    ior: 1.5,
    transmission: 0,
    dispersion: 4,
    clearcoat: 0.55,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.35,
    side: THREE.FrontSide,
  });
  material.transmissionUniforms = params;
  material.transmissionNode = uniform(1);
  material.thicknessNode = params.thickness;
  material.iorNode = params.ior;
  material.transmissionBackdropNode = buildTransmissionBackdropNode(
    getTransmissionBackdropTextureNode(renderer),
    params,
    8,
  );
  material.transmissionBackdropConfig = {
    backside: true,
    thickness: 2.2,
    backsideThickness: 2.2,
    backdropResolutionScale: 1,
    backsideResolutionScale: 1,
    background: "#0b0b10",
  };
  registerTransmissionGlassMaterial(material, scene, camera, renderer);
  return {
    material,
    params,
    config: material.transmissionBackdropConfig,
    dispose() {
      unregisterTransmissionGlassMaterial(material, renderer);
      material.dispose();
    },
  };
}

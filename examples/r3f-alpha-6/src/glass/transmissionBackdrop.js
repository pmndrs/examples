import * as THREE from "three/webgpu";
import { NodeUpdateType } from "three/webgpu";
import { texture } from "three/tsl";

const managers = new WeakMap();

/** Layer used for geometry that should only appear in the transmission backdrop. */
export const TRANSMISSION_BACKDROP_LAYER = 1;

/** userData flag: visible during clean/backside capture, hidden for the main pass. */
export const TRANSMISSION_BACKDROP_ONLY = "transmissionBackdropOnly";

const TARGET_OPTIONS = {
  type: THREE.HalfFloatType,
  minFilter: THREE.LinearMipmapLinearFilter,
  magFilter: THREE.LinearFilter,
  generateMipmaps: true,
};

function collectBackdropOnlyMeshes(scene) {
  const list = [];
  scene.traverse((object) => {
    if (object.isMesh && object.userData?.[TRANSMISSION_BACKDROP_ONLY]) {
      list.push(object);
    }
  });
  return list;
}

function getDrawingBufferSize(renderer) {
  const size = new THREE.Vector2();
  renderer.getDrawingBufferSize(size);
  return size;
}

function getScaledDimensions(renderer, scale) {
  const size = getDrawingBufferSize(renderer);
  return {
    width: Math.max(1, Math.round(size.x * scale)),
    height: Math.max(1, Math.round(size.y * scale)),
  };
}

function getBackdropDimensions(renderer, config) {
  return getScaledDimensions(renderer, config.backdropResolutionScale ?? 1);
}

function getCleanDimensions(renderer, config) {
  const scale = config.backside
    ? (config.backsideResolutionScale ?? 0.5)
    : (config.backdropResolutionScale ?? 1);
  return getScaledDimensions(renderer, scale);
}

function createBackdropTarget(width, height, name) {
  const target = new THREE.RenderTarget(width, height, TARGET_OPTIONS);
  target.texture.name = name;
  return target;
}

function meshUsesGlassMaterial(mesh, materials) {
  if (!mesh.isMesh) return false;

  const meshMaterial = mesh.material;
  if (Array.isArray(meshMaterial)) {
    return meshMaterial.some((entry) => materials.has(entry));
  }

  return materials.has(meshMaterial);
}

function getMergedBackdropConfig(materials) {
  const first = materials.values().next().value;
  return first?.transmissionBackdropConfig ?? {};
}

function resolveBackgroundColor(background) {
  if (background instanceof THREE.Color) return background;
  if (typeof background === "string") return new THREE.Color(background);
  return new THREE.Color("#000000");
}

class TransmissionBackdropManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.materials = new Set();
    this.scene = null;
    this.camera = null;
    this.cleanTarget = null;
    this.backsideTarget = null;
    this.backdropTextureNode = null;
    this.lastCaptureTick = -1;
  }

  register(material, scene, camera) {
    material.isTransmissionGlassMaterial = true;
    this.materials.add(material);
    this.scene = scene;
    this.camera = camera;
    this.ensureResources();
  }

  unregister(material) {
    this.materials.delete(material);
    if (this.materials.size === 0) this.dispose();
  }

  pruneStaleMaterials() {
    if (this.materials.size === 0 || !this.scene) return;

    const activeMaterials = new Set();
    this.scene.traverse((object) => {
      if (!object.isMesh) return;

      const meshMaterial = object.material;
      if (Array.isArray(meshMaterial)) {
        meshMaterial.forEach((entry) => activeMaterials.add(entry));
      } else if (meshMaterial) {
        activeMaterials.add(meshMaterial);
      }
    });

    for (const material of this.materials) {
      if (!activeMaterials.has(material)) {
        this.materials.delete(material);
      }
    }
  }

  ensureResources() {
    const config = getMergedBackdropConfig(this.materials);

    if (!this.cleanTarget) {
      const { width, height } = getCleanDimensions(this.renderer, config);
      this.cleanTarget = createBackdropTarget(
        width,
        height,
        "TransmissionBackdropClean",
      );
    }

    if (config.backside && !this.backsideTarget) {
      const { width, height } = getBackdropDimensions(this.renderer, config);
      this.backsideTarget = createBackdropTarget(
        width,
        height,
        "TransmissionBackdropBackside",
      );
    }

    if (!this.backsideTarget && this.backdropTextureNode) {
      this.backdropTextureNode.value = this.cleanTarget.texture;
    }

    if (!this.backdropTextureNode) {
      this.backdropTextureNode = texture(
        (this.backsideTarget ?? this.cleanTarget).texture,
      );
      this.backdropTextureNode.updateBeforeType = NodeUpdateType.NONE;
    }
  }

  resizeTargets() {
    const config = getMergedBackdropConfig(this.materials);
    const cleanSize = getCleanDimensions(this.renderer, config);

    if (
      this.cleanTarget &&
      (this.cleanTarget.width !== cleanSize.width ||
        this.cleanTarget.height !== cleanSize.height)
    ) {
      this.cleanTarget.setSize(cleanSize.width, cleanSize.height);
    }

    if (config.backside) {
      if (!this.backsideTarget) {
        const { width, height } = getBackdropDimensions(this.renderer, config);
        this.backsideTarget = createBackdropTarget(
          width,
          height,
          "TransmissionBackdropBackside",
        );
        if (this.backdropTextureNode) {
          this.backdropTextureNode.value = this.backsideTarget.texture;
        }
      } else {
        const backsideSize = getBackdropDimensions(this.renderer, config);
        if (
          this.backsideTarget.width !== backsideSize.width ||
          this.backsideTarget.height !== backsideSize.height
        ) {
          this.backsideTarget.setSize(backsideSize.width, backsideSize.height);
        }
      }
    } else if (this.backsideTarget) {
      this.backsideTarget.dispose();
      this.backsideTarget = null;
      if (this.backdropTextureNode && this.cleanTarget) {
        this.backdropTextureNode.value = this.cleanTarget.texture;
      }
    }
  }

  getTextureNode() {
    this.ensureResources();
    return this.backdropTextureNode;
  }

  capture(frameTick) {
    if (this.materials.size === 0 || !this.scene || !this.camera) return;
    if (frameTick === this.lastCaptureTick) return;

    this.pruneStaleMaterials();
    if (this.materials.size === 0 || !this.scene || !this.camera) return;

    this.lastCaptureTick = frameTick;
    this.ensureResources();
    this.resizeTargets();

    const config = getMergedBackdropConfig(this.materials);
    const backdropFillColor = resolveBackgroundColor(config.background);

    const renderer = this.renderer;
    const prevTarget = renderer.getRenderTarget();
    const prevAutoClear = renderer.autoClear;
    const prevBackground = this.scene.background;
    const prevToneMapping = renderer.toneMapping;
    const prevToneMappingExposure = renderer.toneMappingExposure;
    const prevLayerMask = this.camera.layers.mask;

    const hiddenMeshes = [];
    const backdropOnlyMeshes = collectBackdropOnlyMeshes(this.scene);

    for (const mesh of backdropOnlyMeshes) {
      mesh.visible = true;
    }

    this.scene.traverse((object) => {
      if (meshUsesGlassMaterial(object, this.materials) && object.visible) {
        hiddenMeshes.push(object);
        object.visible = false;
      }
    });

    try {
      this.scene.background = backdropFillColor;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.toneMappingExposure = 1;

      this.camera.layers.enable(TRANSMISSION_BACKDROP_LAYER);
      renderer.setRenderTarget(this.cleanTarget);
      renderer.autoClear = true;
      renderer.render(this.scene, this.camera);

      for (const mesh of hiddenMeshes) {
        mesh.visible = true;
      }

      if (config.backside && this.backsideTarget) {
        this.backdropTextureNode.value = this.cleanTarget.texture;

        const materialStates = [];
        for (const material of this.materials) {
          const uniforms = material.transmissionUniforms;
          const materialConfig = material.transmissionBackdropConfig ?? config;
          materialStates.push({
            material,
            thickness: uniforms?.thickness?.value ?? materialConfig.thickness,
            side: THREE.FrontSide,
          });
          material.side = THREE.BackSide;
          if (uniforms?.thickness) {
            uniforms.thickness.value = materialConfig.backsideThickness;
          }
        }

        renderer.setRenderTarget(this.backsideTarget);
        renderer.autoClear = true;
        renderer.render(this.scene, this.camera);

        for (const { material, thickness, side } of materialStates) {
          material.side = side;
          const uniforms = material.transmissionUniforms;
          if (uniforms?.thickness) {
            uniforms.thickness.value = thickness;
          }
        }

        this.backdropTextureNode.value = this.backsideTarget.texture;
      } else {
        this.backdropTextureNode.value = this.cleanTarget.texture;
      }
    } finally {
      this.camera.layers.mask = prevLayerMask;

      for (const mesh of hiddenMeshes) {
        mesh.visible = true;
      }

      for (const mesh of backdropOnlyMeshes) {
        mesh.visible = false;
      }

      this.scene.background = prevBackground;
      renderer.toneMapping = prevToneMapping;
      renderer.toneMappingExposure = prevToneMappingExposure;
      renderer.setRenderTarget(prevTarget);
      renderer.autoClear = prevAutoClear;
    }
  }

  dispose() {
    this.cleanTarget?.dispose();
    this.backsideTarget?.dispose();
    this.cleanTarget = null;
    this.backsideTarget = null;
    this.backdropTextureNode = null;
    managers.delete(this.renderer);
  }
}

function getManager(renderer) {
  let manager = managers.get(renderer);
  if (!manager) {
    manager = new TransmissionBackdropManager(renderer);
    managers.set(renderer, manager);
  }
  return manager;
}

export function registerTransmissionGlassMaterial(
  material,
  scene,
  camera,
  renderer,
) {
  getManager(renderer).register(material, scene, camera);
}

export function unregisterTransmissionGlassMaterial(material, renderer) {
  managers.get(renderer)?.unregister(material);
}

export function captureTransmissionBackdrop(
  renderer,
  scene,
  camera,
  frameTick,
) {
  const manager = managers.get(renderer);
  if (!manager) return;
  manager.scene = scene;
  manager.camera = camera;
  manager.capture(frameTick);
}

export function getTransmissionBackdropTextureNode(renderer) {
  return getManager(renderer).getTextureNode();
}

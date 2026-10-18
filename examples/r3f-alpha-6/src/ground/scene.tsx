import { traceStartup } from "../startup";
import {
  use,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { glyph } from "@pmndrs/glyph";
import {
  Box3,
  MathUtils,
  Vector2,
  Vector3,
  type DirectionalLight,
  type PerspectiveCamera,
  type WebGPURenderer,
} from "three/webgpu";
import { useCameraRig } from "../camera";
import { loadTypography } from "../typography";
import { createEnvironmentMap, studioReady } from "../environment";
import { createGlass } from "../glass/create-glass";
import { updateGlass } from "../glass/update-glass";
import { captureTransmissionBackdrop } from "../glass/transmissionBackdrop";
import { ease } from "../timeline";
import type { Playback } from "../shell/use-playback";
import {
  animationDuration,
  choreographyTime,
  impactTime,
} from "./choreography";
import { groundLayout } from "./layout";
import { createReflections } from "./reflections";
import { createGround } from "./ground";
import { createShadowLight } from "./shadow-light";
import { createGlassTitle } from "./glass-title";
import { createGroundCopy } from "./ground-copy";
import { useGroundCursor } from "./use-ground-cursor";
import type { GroundSettings } from "./settings";

/**
 * Glass type lying on a gradient floor. The camera looks down at the floor, and the remaining copy is
 * printed flat on it. Each part is built in its own effect so a setting only rebuilds what depends on it.
 * After the intro the cursor sweeps the settled shards and a click pops them up.
 */
export function GroundScene({
  playback,
  settings,
  onCameraPose,
  onReady,
  onError,
}: {
  playback: React.RefObject<Playback>;
  settings: GroundSettings;
  onCameraPose: (
    pose: Pick<GroundSettings, "cameraYaw" | "cameraPitch" | "cameraZoom">,
  ) => void;
  onReady: () => void;
  onError: (error: unknown) => void;
}) {
  // A font change keeps the current scene until the new font has loaded.
  const typography = use(
    loadTypography(
      useDeferredValue(settings.displayFont),
      useDeferredValue(settings.detailFont),
    ),
  );
  const studio = use(studioReady);
  const { scene, camera, renderer, size, invalidate } = useThree();
  const live = useRef(settings);
  live.current = settings;
  const clock = useRef({ atmosphere: 0, flow: 0 });
  const startup = useRef({ compiled: false, frames: 0 });
  // The pointer eased in screen space, from -1 to 1. It swings the HDR and the key light.
  const aim = useRef(new Vector2());
  const parts = useRef<{
    key?: { light: DirectionalLight; home: Vector3 };
    reflections?: ReturnType<typeof createReflections>;
    frame?: number;
    ground?: ReturnType<typeof createGround>;
    title?: ReturnType<typeof createGlassTitle>;
    copy?: ReturnType<typeof createGroundCopy>;
    glass?: ReturnType<typeof createGlass>;
  }>({});
  const fov = (camera as PerspectiveCamera).fov;
  // At this distance one world unit at the target is one screen pixel.
  const distance = size.height / 2 / Math.tan(MathUtils.degToRad(fov / 2));
  const readCursor = useGroundCursor();
  const updateCamera = useCameraRig(settings, playback, onCameraPose, {
    distance,
    pitch: [14, 70],
    pointerPitch: [10, 80],
  });
  const {
    environment,
    depth,
    bevel,
    fractureSeed,
    fragmentCount,
    cameraPitch,
  } = settings;
  const layout = groundLayout(
    size.width,
    size.height,
    fov,
    distance,
    cameraPitch,
  );
  const titleAt = layout.at(0, size.height * (size.width < 650 ? 0.09 : 0.04));
  const titlePixel = layout.scale(titleAt);

  useEffect(() => {
    invalidate();
  }, [settings, invalidate]);

  useLayoutEffect(() => {
    const map = createEnvironmentMap(
      renderer as WebGPURenderer,
      studio,
      environment,
    );
    const previous = scene.environment;
    const own = parts.current;
    // The plain environment shows until the first reflection capture replaces it.
    scene.environment = map.texture;
    own.reflections = createReflections(
      renderer as WebGPURenderer,
      scene,
      map.texture,
      distance * 20,
    );
    return () => {
      scene.environment = previous;
      own.reflections?.dispose();
      own.reflections = undefined;
      map.dispose();
    };
  }, [renderer, scene, studio, environment, distance]);

  useLayoutEffect(() => {
    const projection = camera as PerspectiveCamera;
    projection.near = distance * 0.02;
    projection.far = distance * 40;
    projection.updateProjectionMatrix();
    (renderer as WebGPURenderer).shadowMap.enabled = true;
    (renderer as WebGPURenderer).shadowMap.transmitted = true;
    const ground = createGround(size.width, size.height, distance * 16);
    const light = createShadowLight(Math.max(size.width, size.height) * 1.2);
    scene.add(ground.root, light);
    const own = parts.current;
    own.ground = ground;
    own.key = { light, home: light.position.clone() };
    const previousBackground = scene.background;
    scene.background = ground.horizon;
    return () => {
      scene.remove(ground.root, light);
      light.dispose();
      ground.dispose();
      scene.background = previousBackground;
      own.ground = own.key = undefined;
    };
    // The renderer is fixed for the canvas lifetime, so it never triggers a rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, camera, size.width, size.height, distance]);

  useLayoutEffect(() => {
    const glass = createGlass(renderer, scene, camera);
    const own = parts.current;
    // The backdrop pass shows the horizon wherever no ground is drawn.
    glass.config.background = own.ground?.horizon;
    // The "WebGPU First" headline sits at the same screen spot as in the ground copy. Shards bounce off its footprint.
    const headline = Math.min(
      size.width < 650 ? size.width * 0.087 : 50,
      size.height * 0.065,
    );
    const keepClear = new Box3();
    for (const x of [-1, 1])
      for (const y of [-1, 1])
        keepClear.expandByPoint(
          layout
            .at(x * headline * 4.5, -size.height * 0.182 + y * headline * 1.8)
            .sub(titleAt),
        );
    const title = createGlassTitle(
      typography,
      glass.material,
      live.current,
      animationDuration(0) - impactTime,
      (width) =>
        Math.min((size.width * 0.97) / width, size.height * 0.5) * titlePixel,
      keepClear,
      (shards) =>
        (renderer as WebGPURenderer)
          .compileAsync(shards, camera, scene)
          .then(() => invalidate(), onError),
    );
    title.root.position.copy(titleAt);
    scene.add(title.root);
    own.glass = glass;
    own.title = title;
    return () => {
      scene.remove(title.root);
      title.dispose();
      glass.dispose();
      own.title = own.glass = undefined;
    };
    // Title rebuilds follow the geometry settings, not every panel change. `layout` and `titleAt` are
    // rebuilt each render, so their scalar inputs stand in for them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    renderer,
    scene,
    camera,
    invalidate,
    onError,
    typography,
    size.width,
    size.height,
    depth,
    bevel,
    fractureSeed,
    fragmentCount,
    titleAt.x,
    titleAt.z,
    titlePixel,
  ]);

  useLayoutEffect(() => {
    const copy = createGroundCopy(
      typography,
      live.current,
      onError,
      groundLayout(size.width, size.height, fov, distance, cameraPitch),
      size.width,
      size.height,
    );
    scene.add(copy.root);
    const own = parts.current;
    own.copy = copy;
    return () => {
      scene.remove(copy.root);
      copy.dispose();
      glyph.shape();
      own.copy = undefined;
    };
  }, [
    scene,
    typography,
    onError,
    size.width,
    size.height,
    fov,
    distance,
    cameraPitch,
  ]);

  useLayoutEffect(() => {
    traceStartup("Compiling ground scene", 0.95);
    let alive = true;
    // Compile the complete page before releasing the intro clock. The frame loop finishes the startup.
    // Skip effects torn down by StrictMode before starting asynchronous GPU work.
    Promise.resolve()
      .then(() =>
        alive
          ? (renderer as WebGPURenderer).compileAsync(scene, camera)
          : undefined,
      )
      .then(() => {
        if (alive) {
          traceStartup("Scene compiled");
          startup.current.compiled = true;
        }
      })
      .catch((error) => {
        if (alive) onError(error);
      });
    return () => {
      alive = false;
    };
  }, [renderer, scene, camera, onError]);

  useFrame(
    (state) => {
      const p = playback.current;
      const s = live.current;
      const { ground, title, copy, glass } = parts.current;
      // The opening hold lasts until the shards arrive from the worker.
      const end =
        title?.shattered || p.time > s.breakDelay
          ? animationDuration(s.breakDelay)
          : s.breakDelay;
      if (p.ready && p.playing && !document.hidden)
        p.time = Math.min(end, p.time + Math.min(state.delta, 0.05));
      if (s.animate && !p.reduced && !document.hidden) {
        clock.current.atmosphere += Math.min(state.delta, 0.05);
        clock.current.flow += Math.min(state.delta, 0.05) * s.speed;
        invalidate();
      }
      updateCamera(state.delta);
      const t = choreographyTime(p.time, s.breakDelay);
      const light = ease(t, impactTime, impactTime + 2.1);
      ground?.update(s, light);
      if (ground) ground.time.value = clock.current.flow;
      const cursor = readCursor();
      const target = cursor.ndc && !p.reduced ? cursor.ndc : { x: 0, y: 0 };
      aim.current.lerp(
        target as Vector2,
        1 - Math.exp(-4 * Math.min(state.delta, 0.05)),
      );
      if (aim.current.distanceToSquared(target as Vector2) > 1e-5) invalidate();
      const swing = aim.current.x * s.lightFollow;
      // The reflection dome applies the environment rotation and intensity, so the scene's own stay neutral.
      scene.environmentRotation.set(0, 0, 0);
      scene.environmentIntensity = 1;
      const { key } = parts.current;
      if (key) {
        key.light.intensity = s.lightIntensity;
        const span = key.home.y;
        key.light.position.set(
          key.home.x + swing * span * 0.6,
          key.home.y,
          key.home.z - aim.current.y * s.lightFollow * span * 0.5,
        );
      }
      if (glass) updateGlass(glass, s, clock.current.atmosphere);
      if (
        title?.update(
          t,
          s,
          state.delta,
          s.cursorCollider ? cursor.point : undefined,
          s.cursorCollider ? cursor.press : undefined,
        )
      )
        invalidate();
      copy?.update(t, Math.min(1, p.time / animationDuration(s.breakDelay)), s);
      copy?.follow(camera as PerspectiveCamera, renderer.domElement);
      glyph.shape();
      const { reflections, key: sun } = parts.current;
      // Every other frame is plenty for reflections.
      if (
        reflections &&
        title &&
        copy &&
        sun &&
        (parts.current.frame = (parts.current.frame ?? 0) + 1) % 2 === 0
      ) {
        scene.environment = reflections.update(
          title.root.position.clone().setY(titlePixel * 30),
          [title.root, copy.screen],
          [sun.light],
          s.environmentRotation + aim.current.x * s.hdrFollow * 70,
          s.environmentIntensity,
        );
      }
      captureTransmissionBackdrop(renderer, scene, camera, state.elapsed);
      // Every pass draws a few frames behind the loader so first-use stalls and the reflection lighting settle before the intro starts.
      if (!p.ready) {
        invalidate();
        if (
          startup.current.compiled &&
          title?.shattered &&
          ++startup.current.frames > 4
        ) {
          traceStartup("Scene ready", 1);
          onReady();
        }
      }
    },
    { priority: 1 },
  );
  return null;
}

import type { ThreeElement, ThreeElements } from "@react-three/fiber";
import type { Vector2 } from "three";
import type {
  WaterPass,
  UnrealBloomPass,
  FilmPass,
  LUTPass,
} from "three-stdlib";

// UnrealBloomPass's constructor parameters are typed as required, but the
// implementation falls back to defaults when any of them (including
// `resolution`) are omitted, so every entry is optional here (matching the
// original JSX, which passes `undefined` for `resolution`).
type UnrealBloomPassElement = Omit<
  ThreeElement<typeof UnrealBloomPass>,
  "args"
> & {
  args?: [
    resolution?: Vector2,
    strength?: number,
    radius?: number,
    threshold?: number,
  ];
};

// LUTPass's constructor parameters are typed as required, but the JSX usage
// below never passes `args`, so make it optional here (matching the original
// JSX, which omits it).
type LUTPassElement = Omit<ThreeElement<typeof LUTPass>, "args"> & {
  args?: ConstructorParameters<typeof LUTPass>;
};

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      waterPass: ThreeElement<typeof WaterPass>;
      unrealBloomPass: UnrealBloomPassElement;
      filmPass: ThreeElement<typeof FilmPass>;
      lUTPass: LUTPassElement;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      waterPass: ThreeElement<typeof WaterPass>;
      unrealBloomPass: UnrealBloomPassElement;
      filmPass: ThreeElement<typeof FilmPass>;
      lUTPass: LUTPassElement;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
    interface IntrinsicElements {
      waterPass: ThreeElement<typeof WaterPass>;
      unrealBloomPass: UnrealBloomPassElement;
      filmPass: ThreeElement<typeof FilmPass>;
      lUTPass: LUTPassElement;
    }
  }
}

import { Suspense, useDeferredValue } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, ContactShadows } from '@react-three/drei'
import { useControls } from 'leva'
import tunnel from 'tunnel-rat'

// From the poimandres market (https://market.pmnd.rs/), vendored locally since the original CDN is offline.
import beechModel from './assets/tree-beech.gltf?url'
import limeModel from './assets/tree-lime.gltf?url'
import spruceModel from './assets/tree-spruce.gltf?url'

const status = tunnel()

const MODELS = {
  Beech: beechModel,
  Lime: limeModel,
  Spruce: spruceModel
}

export default function App() {
  const { model } = useControls({ model: { value: 'Beech', options: Object.keys(MODELS) } })
  return (
    <>
      <header>
        This is a {model.toLowerCase()} tree.
        <br />
        <status.Out />
      </header>
      <Canvas camera={{ position: [-10, 10, 40], fov: 50 }}>
        <hemisphereLight color="white" groundColor="blue" intensity={0.75 * Math.PI} />
        <spotLight position={[50, 50, 10]} intensity={Math.PI} decay={0} angle={0.15} penumbra={1} />
        <group position={[0, -10, 0]}>
          <Suspense fallback={<status.In>Loading ...</status.In>}>
            <Model position={[0, 0.25, 0]} url={MODELS[model]} />
          </Suspense>
          <ContactShadows scale={20} blur={10} far={20} />
        </group>
        <OrbitControls />
      </Canvas>
    </>
  )
}

function Model({ url, ...props }) {
  const deferred = useDeferredValue(url)
  const { scene } = useGLTF(deferred)
  // <primitive object={...} mounts an already existing object
  return <primitive object={scene} {...props} />
}

// Uncomment in order to silently pre-load all models
//Object.values(MODELS).forEach(useGLTF.preload)

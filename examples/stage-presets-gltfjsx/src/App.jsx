import { Canvas } from '@react-three/fiber'
import { Center, AccumulativeShadows, RandomizedLight, Environment, OrbitControls } from '@react-three/drei'
import { useControls, button } from 'leva'
import { Model } from './Datsun'
import { Effects } from './Effects'

export default function App() {
  const { color, realism, importanceSampling } = useControls({
    color: '#ff9621',
    realism: true,
    importanceSampling: true,
    screenshot: button(() => {
      const link = document.createElement('a')
      link.setAttribute('download', 'canvas.png')
      link.setAttribute('href', document.querySelector('canvas').toDataURL('image/png').replace('image/png', 'image/octet-stream'))
      link.click()
    })
  })
  return (
    <Canvas gl={{ antialias: false, preserveDrawingBuffer: true }} shadows camera={{ position: [4, 0, 6], fov: 35 }}>
      <group position={[0, -0.75, 0]}>
        <Center top>
          <Model color={color} />
        </Center>
        <AccumulativeShadows>
          <RandomizedLight position={[2, 5, 5]} />
        </AccumulativeShadows>
      </group>
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      {realism && <Effects importanceSampling={importanceSampling} />}
      <Environment preset="dawn" background blur={1} />
    </Canvas>
  )
}

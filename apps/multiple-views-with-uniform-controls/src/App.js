import * as THREE from 'three'
import { forwardRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, View, Center, Environment, MapControls, OrbitControls, PivotControls, RandomizedLight } from '@react-three/drei'
import { PerspectiveCamera, OrthographicCamera, AccumulativeShadows } from '@react-three/drei'
import { Menu, Button } from '@mantine/core'
import * as ICONS from '@tabler/icons'
import useRefs from 'react-use-refs'
import create from 'zustand'

const matrix = new THREE.Matrix4()
const positions = { Top: [0, 10, 0], Bottom: [0, -10, 0], Left: [-10, 0, 0], Right: [10, 0, 0], Back: [0, 0, -10], Front: [0, 0, 10] }
const useStore = create((set) => ({
  projection: 'Perspective',
  top: 'Back',
  middle: 'Top',
  bottom: 'Right',
  setPanelView: (which, view) => set({ [which]: view }),
  setProjection: (projection) => set({ projection })
}))

export function App() {
  const [view1, view2, view3, view4] = useRefs()
  return (
    <div className="container">
      {/** A single canvas, it will only render when things move or change, and otherwise stay idle ... */}
      <Canvas shadows frameloop="demand" eventSource={document.getElementById('root')} className="canvas">
        {/** Each view tracks one of the divs above and creates a sandboxed environment that behaves
             as if it were a normal everyday canvas, <View> will figure out the gl.scissor stuff alone. */}
        <View.Port />
      </Canvas>
      {/** Tracking div's, regular HTML and made responsive with CSS media-queries ... */}
      <MainPanel ref={view1}>
        <CameraSwitcher />
        <PivotControls scale={0.4} depthTest={false} matrix={matrix} />
        <Scene background="aquamarine" matrix={matrix}>
          <AccumulativeShadows temporal frames={100} position={[0, -0.4, 0]} scale={14} alphaTest={0.85} color="orange" colorBlend={0.5}>
            <RandomizedLight amount={8} radius={8} ambient={0.5} position={[5, 5, -10]} bias={0.001} />
          </AccumulativeShadows>
        </Scene>
        <OrbitControls makeDefault />
      </MainPanel>
      <SidePanel ref={view2} which="top">
        <PanelCamera which="top" />
        <PivotControls activeAxes={[true, true, false]} depthTest={false} matrix={matrix} />
        <Scene background="lightpink" matrix={matrix} />
        <MapControls makeDefault screenSpacePanning enableRotate={false} />
      </SidePanel>
      <SidePanel ref={view3} which="middle">
        <PanelCamera which="middle" />
        <PivotControls activeAxes={[true, false, true]} depthTest={false} matrix={matrix} />
        <Scene background="peachpuff" matrix={matrix} />
        <MapControls makeDefault screenSpacePanning enableRotate={false} />
      </SidePanel>
      <SidePanel ref={view4} which="bottom">
        <PanelCamera which="bottom" />
        <PivotControls activeAxes={[false, true, true]} depthTest={false} matrix={matrix} />
        <Scene background="skyblue" matrix={matrix} />
        <MapControls makeDefault screenSpacePanning enableRotate={false} />
      </SidePanel>
    </div>
  )
}

function Scene({ background = 'white', children, ...props }) {
  const { nodes, materials } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bricks/model.gltf')
  return (
    <>
      <color attach="background" args={[background]} />
      <ambientLight />
      <directionalLight position={[10, 10, -15]} castShadow shadow-bias={-0.0001} shadow-mapSize={1024} />
      <Environment preset="city" />
      <group
        matrixAutoUpdate={false}
        // Why onUpdate and not just matrix={matrix} ?
        // This is an implementation detail, overwriting (most) transform objects isn't possible in Threejs
        // because they are defined read-only. Therefore Fiber will always call .copy() if you pass
        // an object, for instance matrix={new THREE.Matrix4()} or position={new THREE.Vector3()}
        // In this rare case we do not want it to copy the matrix, but refer to it.
        onUpdate={(self) => (self.matrix = matrix)}
        {...props}>
        <Center>
          <mesh castShadow geometry={nodes.bricks.geometry} material={materials['Stone.014']} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color="goldenrod" roughness={0} metalness={1} />
          </mesh>
        </Center>
        {children}
      </group>
    </>
  )
}

function CameraSwitcher() {
  const projection = useStore((state) => state.projection)
  // Would need to remember the old coordinates to be more useful ...
  return projection === 'Perspective' ? (
    <PerspectiveCamera makeDefault position={[4, 4, 4]} fov={25} />
  ) : (
    <OrthographicCamera makeDefault position={[4, 4, 4]} zoom={280} />
  )
}

function PanelCamera({ which }) {
  const view = useStore((state) => state[which])
  return <OrthographicCamera makeDefault position={positions[view]} zoom={100} />
}

const MainPanel = forwardRef(({ children, ...props }, fref) => {
  const projection = useStore((state) => state.projection)
  const setProjection = useStore((state) => state.setProjection)
  return (
    <div ref={fref} className="panel" style={{ gridArea: 'main' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>{children}</View>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button>{projection}</Button>
        </Menu.Target>
        <Menu.Dropdown onClick={(e) => setProjection(e.target.innerText)}>
          <Menu.Item icon={<ICONS.IconPerspective size={14} />}>Perspective</Menu.Item>
          <Menu.Item icon={<ICONS.IconPerspectiveOff size={14} />}>Orthographic</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  )
})

const SidePanel = forwardRef(({ which, children }, fref) => {
  const value = useStore((state) => state[which])
  const setPanelView = useStore((state) => state.setPanelView)
  return (
    <div ref={fref} className="panel" style={{ gridArea: which }}>
      <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>{children}</View>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button>{value}</Button>
        </Menu.Target>
        <Menu.Dropdown onClick={(e) => setPanelView(which, e.target.innerText)}>
          <Menu.Item icon={<ICONS.IconArrowBigTop size={14} />}>Top</Menu.Item>
          <Menu.Item icon={<ICONS.IconArrowBigDown size={14} />}>Bottom</Menu.Item>
          <Menu.Item icon={<ICONS.IconArrowBigLeft size={14} />}>Left</Menu.Item>
          <Menu.Item icon={<ICONS.IconArrowBigRight size={14} />}>Right</Menu.Item>
          <Menu.Item icon={<ICONS.IconHomeUp size={14} />}>Front</Menu.Item>
          <Menu.Item icon={<ICONS.IconHomeDown size={14} />}>Back</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  )
})

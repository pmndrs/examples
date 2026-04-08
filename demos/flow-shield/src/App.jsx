import { useCallback, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Leva, useControls } from 'leva'
import SceneContent from './components/playground/SceneContent'
import UIOverlay from './components/overlay/UIOverlay'
import OverlayButtons from './components/overlay/OverlayButtons'
import LoadingOverlay from './components/overlay/LoadingOverlay'
import { LEVA_THEME } from './components/theme/theme'

export default function App() {
  const [showGrid, setShowGrid] = useState(true)
  const [hideLeva, setHideLeva] = useState(false)
  const [glbUrl, setGlbUrl] = useState(null)
  const [preset, setPreset] = useState('default')
  const [isLoadingModel, setIsLoadingModel] = useState(false)
  const glbUrlRef = useRef(null)

  const handleLoadGlb = useCallback((file) => {
    if (glbUrlRef.current) URL.revokeObjectURL(glbUrlRef.current)
    const url = URL.createObjectURL(file)
    glbUrlRef.current = url
    setIsLoadingModel(true)
    setGlbUrl(url)
  }, [])

  const handleModelLoaded = useCallback(() => {
    setIsLoadingModel(false)
  }, [])

  const handleClearGlb = useCallback(() => {
    if (glbUrlRef.current) URL.revokeObjectURL(glbUrlRef.current)
    glbUrlRef.current = null
    setGlbUrl(null)
  }, [])

  const { mode } = useControls(
    'Scene',
    {
      mode: {
        value: 'Background',
        options: ['Background', 'Frame'],
        label: 'Mode'
      }
    },
    { collapsed: true }
  )

  return (
    <>
      <Leva theme={LEVA_THEME} titleBar={{ title: 'CONTROLS' }} collapsed={false} flat={false} oneLineLabels={false} hidden={hideLeva} />
      <div style={{ position: 'fixed', inset: 0 }}>
        <Canvas
          shadows
          camera={{ position: [8, 5, 8], fov: 50, near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#0e0d0c' }}
          dpr={[1, 1.5]}
        >
          <SceneContent showGrid={showGrid} mode={mode} glbUrl={glbUrl} onModelLoaded={handleModelLoaded} preset={preset} />
        </Canvas>
      </div>
      <UIOverlay />
      <OverlayButtons
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((value) => !value)}
        hideLeva={hideLeva}
        onToggleLeva={() => setHideLeva((value) => !value)}
        hasGlb={glbUrl !== null}
        onLoadGlb={handleLoadGlb}
        onClearGlb={handleClearGlb}
        preset={preset}
        onSetPreset={setPreset}
      />
      <LoadingOverlay visible={isLoadingModel} />
    </>
  )
}

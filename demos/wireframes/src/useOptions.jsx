import { useControls, folder } from 'leva'

export function useOptions() {
  return useControls(() => ({
    Shader: folder(
      {
        thickness: { value: 0.02, min: 0, max: 1 },
        fillMix: { value: 0.25, min: 0, max: 1 },
        simplify: { value: false }
      },
      { collapsed: true }
    ),
    Colors: folder(
      {
        background: { value: '#e3e3e3' },
        fill: { value: '#e3e3e3' },
        fillOpacity: { value: 0, min: 0, max: 1 },
        stroke: { value: '#202020' },
        strokeOpacity: { value: 1, min: 0, max: 1 },
        backfaceStroke: { value: '#c5c5c5' },
        colorBackfaces: { value: true }
      },
      { collapsed: true }
    ),
    Dash: folder(
      {
        dash: { value: false },
        dashInvert: { value: false },
        dashRepeats: { value: 9, min: 0, max: 20 },
        dashLength: { value: 0.7, min: 0, max: 1 }
      },
      { collapsed: true }
    ),
    Squeeze: folder(
      {
        squeeze: { value: false },
        squeezeMin: { value: 0.1, min: 0, max: 1 },
        squeezeMax: { value: 1, min: 0, max: 1 }
      },
      { collapsed: true }
    )
  }))
}

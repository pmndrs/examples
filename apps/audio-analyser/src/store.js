import create from 'zustand'
import { addEffect } from '@react-three/fiber'

async function createAudio(url, { threshold, expire } = {}) {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  const context = new (window.AudioContext || window.webkitAudioContext)()
  const analyser = context.createAnalyser()
  analyser.fftSize = 2048
  const data = new Uint8Array(analyser.frequencyBinCount)
  const source = context.createBufferSource()
  source.buffer = await new Promise((res) => context.decodeAudioData(buffer, res))
  source.loop = true
  const gainNode = context.createGain()
  gainNode.gain.value = 1
  gainNode.connect(context.destination)
  source.connect(analyser)
  analyser.connect(gainNode)

  let time = Date.now()
  let state = {
    source,
    data,
    gain: 1,
    signal: false,
    avg: 0,
    update: () => {
      let now = Date.now()
      let value = 0
      analyser.getByteFrequencyData(data)
      for (let i = 0; i < data.length; i++) value += data[i]
      const avg = (state.avg = value / data.length)
      if (threshold && avg > threshold && now - time > expire) {
        time = Date.now()
        state.signal = true
      } else state.signal = false
    },
    setGain(level) {
      gainNode.gain.setValueAtTime((state.gain = level), context.currentTime)
    },
  }

  return state
}

const mockData = () => ({ signal: false, avg: 0, gain: 1, data: [] })

const useStore = create((set, get) => {
  const drums = createAudio('/drums.mp3', { threshold: 10, expire: 500 })
  const snare = createAudio('/snare.mp3', { threshold: 40, expire: 500 })
  const synth = createAudio('/synth.mp3')
  return {
    loaded: false,
    clicked: false,
    audio: { drums: mockData(), snare: mockData(), synth: mockData() },
    track: { synthonly: false, kicks: 0, loops: 0 },
    api: {
      async loaded() {
        set({
          loaded: true,
          audio: {
            drums: await drums,
            snare: await snare,
            synth: await synth,
          },
        })
      },
      start() {
        const audio = get().audio
        const files = Object.values(audio)
        const track = get().track
        files.forEach(({ source }) => source.start(0))
        set({ clicked: true })
        addEffect(() => {
          files.forEach(({ update }) => update())
          if (audio.drums.signal) track.kicks++
          if (audio.snare.signal) {
            if (track.loops++ > 6) {
              track.synthonly = !track.synthonly
              audio.drums.setGain(track.synthonly ? 0 : 1)
              audio.snare.setGain(track.synthonly ? 0 : 1)
              track.loops = 0
            }
            track.kicks = 0
          }
        })
      },
    },
  }
})

export default useStore

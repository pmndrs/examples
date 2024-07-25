import create from "zustand"
import bgAudio from "./resources/sawsquarenoise_-_01_-_Towel_Defence_Splash_Screen.mp3"
import pingAudio from "./resources/select_006.ogg"
import spawnAudio from "./resources/select_007.ogg"

const ping = new Audio(pingAudio)
const spawn = new Audio(spawnAudio)
const bg = new Audio(bgAudio)
bg.loop = true

const useStore = create((set) => ({
  points: 0,
  startup: true,
  restart: false,
  enemies: [
    { right: true, long: true, y: 0, speed: 0.05, color: "hotpink" },
    { right: true, long: false, y: 1, speed: 0.01, color: "hotpink" },
    { right: true, long: true, y: 3, speed: 0.075, color: "cyan" },
    { right: true, long: false, y: 4, speed: 0.115, color: "hotpink" },
    { right: true, long: false, y: 4.5, speed: 0.155, color: "orange" },
    { right: true, long: false, y: 3.5, speed: 0.135, color: "orange" },
    { right: false, long: true, y: 1.5, speed: 0.105, color: "cyan" },
    { right: false, long: false, y: 2.5, speed: 0.085, color: "hotpink" },
    { right: false, long: true, y: 3.5, speed: 0.02, color: "cyan" },
    { right: false, long: false, y: 5, speed: 0.09, color: "hotpink" },
    { right: false, long: false, y: 1.25, speed: 0.175, color: "cyan" },
    { right: false, long: false, y: 4, speed: 0.145, color: "orange" },
    { right: false, long: false, y: 5, speed: 0.165, color: "orange" },
  ],
  start: () => {
    set({ startup: false })
    //bg.play()
    document.body.style.cursor = "none"
  },
  reset: () => {
    spawn.play((spawn.currentTime = 0))
    set({ points: 0, restart: true })
    setTimeout(() => set({ restart: false }), 10)
  },
  contact: (e) => {
    if (e.contact.impactVelocity > 4) set((state) => ({ points: state.points + 1 }))
    ping.play((ping.currentTime = 0))
  },
}))

export { useStore }

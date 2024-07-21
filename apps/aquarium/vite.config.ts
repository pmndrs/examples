import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(async ({ command, mode }) => {
  const plugins = [react()]

  if (process.env.CHEESY_CANVAS) {
    const cheesyCanvas = (await import('@pmndrs/examples/vite-plugin-cheesy-canvas')).default
    plugins.push(cheesyCanvas())
  }

  return {
    plugins
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glslify from 'vite-plugin-glslify/dist/index.mjs'

export default defineConfig({
  plugins: [react(), glslify({ include: [/\.jsx$/] })],
})

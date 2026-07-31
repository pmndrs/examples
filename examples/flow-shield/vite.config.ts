import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      three: resolve(__dirname, 'node_modules/three'),
      postprocessing: resolve(__dirname, 'node_modules/postprocessing')
    },
    dedupe: ['three', 'postprocessing']
  }
})

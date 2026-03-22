import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ui': path.resolve(__dirname, './src/renderer/ui'),
      '@api': path.resolve(__dirname, './src/renderer/api'),
      '@stores': path.resolve(__dirname, './src/renderer/stores')
    }
  },
  root: 'src/renderer',
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true
  }
})
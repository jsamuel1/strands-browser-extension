import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'ES2020',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        index: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  plugins: [
    {
      name: 'copy-manifest',
      closeBundle() {
        try {
          copyFileSync('manifest.json', 'dist/manifest.json')
          console.log('✓ Copied manifest.json to dist/')
        } catch (err) {
          console.error('Failed to copy manifest.json:', err)
        }
      }
    }
  ]
})

import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts')
        }
      },
      externalizeDeps: true
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts')
        }
      },
      externalizeDeps: true
    }
  },
  renderer: {
    root: '.',
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})

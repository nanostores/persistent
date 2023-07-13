// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      input: {
        bfcachetest: resolve(__dirname, 'bfcachetest.html'),
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})

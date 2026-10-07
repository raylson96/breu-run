import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/proxy-chipamazonia': {
        target: 'https://www.chipamazonia.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-chipamazonia/, '')
      },
      '/proxy-chipbreubranco': {
        target: 'https://www.chipbreubranco.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-chipbreubranco/, '')
      },
      '/proxy-chippara': {
        target: 'https://www.chippara.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-chippara/, '')
      },
      '/proxy-supera': {
        target: 'https://www.superachipcrono.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-supera/, '')
      }
    }
  }
})


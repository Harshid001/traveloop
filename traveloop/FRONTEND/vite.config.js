import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  optimizeDeps: {
    include: ['maplibre-gl'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('src/data/destinationsData')) {
            return 'destinationsData';
          }
          if (id.includes('node_modules/maplibre-gl')) {
            return 'maplibre-vendor';
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/framer-motion')) {
            return 'ui-vendor';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
})

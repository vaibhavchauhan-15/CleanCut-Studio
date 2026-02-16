import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@imgly/background-removal']
  },
  server: {
    // Enable cross-origin isolation for multi-threading and SharedArrayBuffer
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    // Enable CORS for external resources
    cors: true
  },
  build: {
    target: 'esnext',
    // Increase chunk size warning limit for AI models
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'framer-vendor': ['framer-motion'],
          'background-removal': ['@imgly/background-removal']
        }
      }
    }
  }
})

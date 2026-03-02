import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // React 19 mein react-is ka rasta saaf karne ke liye
      'react-is': 'react-is',
    },
  },
  optimizeDeps: {
    include: ['recharts', 'react-is'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Recharts ko alag se bundle karega taaki dependency error na aaye
          recharts: ['recharts'],
        },
      },
    },
  },
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Isse Vite ko pata chal jayega ki react-is kahan se uthana hai
      'react-is': 'react-is',
    },
  },
  build: {
    rollupOptions: {
      // Isse Rollup ko force karenge ki react-is ko bundle mein shamil kare
      external: [],
    },
  },
})
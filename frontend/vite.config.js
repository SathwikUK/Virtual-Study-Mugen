import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // This function tells Rollup to split vendor code into its own chunk
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
    // Increase the warning limit if necessary (value is in kB)
    chunkSizeWarningLimit: 5000,
  },
})

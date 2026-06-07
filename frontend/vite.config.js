import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This strictly maps 'global' to 'window' to fix the ReferenceError: global is not defined
    global: 'window',
  },
  resolve: {
    alias: {
      // This ensures that any package looking for 'process' or 'util' finds the browser-friendly versions
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      // We map 'util' directly to the installed 'util' package for full browser compatibility
      util: 'util',
    },
  },
  // This section forces Vite to bundle the util package for the browser
  // solving the "externalized for browser compatibility" error.
  optimizeDeps: {
    include: ['util']
  }
})
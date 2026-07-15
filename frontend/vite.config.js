import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// DeskFlow frontend Vite configuration.
// Proxies /api requests to the local backend during development so the
// browser never hits CORS issues while developing.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

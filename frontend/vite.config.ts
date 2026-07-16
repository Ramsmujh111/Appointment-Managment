import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls so we don't hit CORS issues in dev
      '/api': 'http://localhost:3000',
    },
  },
});

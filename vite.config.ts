import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
    // HTTPS required for getUserMedia (microphone) on non-localhost devices (iPad)
    https: {},
  },
  plugins: [react(), tailwindcss(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});

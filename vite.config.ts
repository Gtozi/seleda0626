import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const hmrPort = process.env.HMR_PORT ? parseInt(process.env.HMR_PORT, 10) : undefined;

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: hmrPort
        ? { port: hmrPort, strictPort: false }
        : { strictPort: false },
      watch: {},
    },
  };
});

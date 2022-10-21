import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import analyze from 'rollup-plugin-analyzer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), analyze()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src/'),
      '~components': path.resolve(__dirname, './src/components'),
      '~store': path.resolve(__dirname, './src/store'),
      '~utils': path.resolve(__dirname, './src/utils'),
      '~constant': path.resolve(__dirname, './src/constant'),
    },
  },
});

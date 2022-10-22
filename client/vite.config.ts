import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import analyze from 'rollup-plugin-analyzer';
import dayjs from 'dayjs';

// https://vitejs.dev/config/
export default ({ mode }) => {
  return defineConfig({
    plugins: [react(), analyze()],
    base:
      mode === 'dev'
        ? '/'
        : 'https://image.xjq.icu/runcode/' + dayjs().format('YYYY-MM-DD') + '/',
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
};

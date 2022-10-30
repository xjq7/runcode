import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import analyze from 'rollup-plugin-analyzer';
import dayjs from 'dayjs';

const cdnPrefix =
  'https://image.xjq.icu/runcode/' + dayjs().format('YYYY-MM-DD') + '/';

// https://vitejs.dev/config/
export default ({ command }) => {
  const isBuild = command === 'build';
  return defineConfig({
    plugins: [react(), analyze()],
    base: isBuild ? cdnPrefix : '/',
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src/'),
        '~components': path.resolve(__dirname, './src/components'),
        '~store': path.resolve(__dirname, './src/store'),
        '~utils': path.resolve(__dirname, './src/utils'),
        '~constant': path.resolve(__dirname, './src/constant'),
        '~hooks': path.resolve(__dirname, './src/hooks'),
        '~pages': path.resolve(__dirname, './src/pages'),
        '~services': path.resolve(__dirname, './src/services'),
      },
    },
  });
};

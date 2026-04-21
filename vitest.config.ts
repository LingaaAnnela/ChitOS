import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    tsconfig: './tsconfig.spec.json',
  },
  resolve: {
    alias: {
      '@core':     resolve(__dirname, 'src/app/core'),
      '@features': resolve(__dirname, 'src/app/features'),
      '@shared':   resolve(__dirname, 'src/app/shared'),
      '@env':      resolve(__dirname, 'src/environments'),
    },
  },
});

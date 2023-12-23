import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, './src/index.ts'),
      output: {
        entryFileNames: 'index.js',
        dir: 'dist'
      }
    },
  },
});

import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      $lib: resolve(__dirname, './src/lib')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    env: {
      JWT_SECRET: 'test-secret-key-change-in-production'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
});

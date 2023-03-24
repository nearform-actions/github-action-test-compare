import { defineConfig } from 'vitest/config';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 120000,
  },
  plugins: [viteTsconfigPaths()],
});

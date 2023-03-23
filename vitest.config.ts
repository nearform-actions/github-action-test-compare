import { configDefaults, defineConfig } from 'vitest/config';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'tests/branches/**'],
    globals: true,
    testTimeout: 120000,
  },
  plugins: [viteTsconfigPaths()],
});

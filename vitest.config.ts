import { configDefaults, defineConfig } from 'vitest/config';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'tests/branches/**'],
    globals: true,
    testTimeout: 600000,
    outputDiffMaxLines: 1000,
  },
  plugins: [viteTsconfigPaths()],
});

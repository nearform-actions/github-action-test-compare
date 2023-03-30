import type { Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
  modulePathIgnorePatterns: ['<rootDir>/tests/branches'],
  testTimeout: 120000,
};

export default jestConfig;

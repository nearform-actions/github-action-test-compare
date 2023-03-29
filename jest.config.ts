import type { Config } from '@jest/types';

const jestConfig: Config.InitialOptions = {
  testRegex: '(/__tests__/.*|(\\.|/)(test))\\.[jt]sx?$',
  testTimeout: 120000,
};

export default jestConfig;

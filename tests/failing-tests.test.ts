import path from 'path';
import { createMockGitHub, MockGitHub, failedStep, successStep } from './utils';

describe('github-action-test-compare', () => {
  let mockGitHub: MockGitHub;

  beforeEach(async () => {
    mockGitHub = createMockGitHub({
      files: [
        {
          src: path.join(__dirname, 'production/package.json'),
          dest: 'package.json',
        },
        {
          src: path.join(__dirname, 'production/vitest.config.ts'),
          dest: 'vitest.config.json',
        },
        {
          src: path.join(__dirname, 'production/test/production-code.ts'),
          dest: 'test/production-code.ts',
        },
        {
          src: path.join(__dirname, 'production/test/production.test.ts'),
          dest: 'test/production.test.ts',
        },
      ],
    });

    await mockGitHub.setup();
  });

  afterEach(async () => {
    await mockGitHub.teardown();
  });

  it('should return error for no tests folder available', async () => {
    const act = await mockGitHub.act();
    const result = await act
      .setEvent({
        pull_request: {
          head: {
            ref: 'pr',
          },
          base: {
            ref: 'main',
          },
        },
      })
      .runEvent('pull_request');

    expect(result).toEqual([
      successStep('Main Checkout'),
      failedStep('Main Test compare'),
      // failedStep(
      //   'Main Copy tests',
      //   `cp: cannot stat '__tests__': No such file or directory`,
      // ),
      successStep('Post Test compare'),
    ]);
  });
});

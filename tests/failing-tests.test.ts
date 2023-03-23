import path from 'path';
import { createMockGitHub, MockGitHub, failedStep, successStep } from './utils';

describe('github-action-test-compare', () => {
  let mockGitHub: MockGitHub;

  beforeEach(async () => {
    mockGitHub = createMockGitHub({
      files: [
        // {
        //   src: path.join(__dirname, 'production/package.json'),
        //   dest: 'package.json',
        // },
        // {
        //   src: path.join(__dirname, 'production/vitest.config.ts'),
        //   dest: 'vitest.config.json',
        // },
        // {
        //   src: path.join(__dirname, 'production/test/production-code.ts'),
        //   dest: 'test/production-code.ts',
        // },
        // {
        //   src: path.join(__dirname, 'production/test/production.test.ts'),
        //   dest: 'test/production.test.ts',
        // },
        {
          src: path.join(__dirname, './branches/pr-production'),
          dest: '.',
        },
      ],
    });

    await mockGitHub.setup();
  });

  afterEach(async () => {
    // await mockGitHub.teardown();
  });

  it('should return error for no tests folder available', async () => {
    const { runEvent } = await mockGitHub.configure((act) =>
      act.setEvent({
        pull_request: {
          head: {
            ref: 'pull-request2',
          },
          base: {
            ref: 'main',
          },
        },
      }),
    );

    const result = await runEvent('pull_request', {
      logFile: 'failing-tests.log',
    });

    //     const result = await act
    //       .setEvent()
    //       .runEvent('pull_request', {
    // cwd:
    //       });

    console.log(
      (result.find((s) => s.name === 'Main Dump vars') as any)?.output ??
        'No dumped vars',
    );

    console.log(
      (result.find((s) => s.name === 'Main Install') as any)?.output ??
        'No data',
    );

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

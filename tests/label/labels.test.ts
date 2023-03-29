import path from 'path';
import { createMockGitHub, MockGitHub, successStep } from '../utils';

describe('github-action-test-compare', () => {
  let mockGitHub: MockGitHub;

  beforeEach(async () => {
    mockGitHub = createMockGitHub({
      files: [
        {
          src: path.resolve(__dirname, './main'),
          dest: '.',
        },
        {
          src: path.resolve(__dirname, './main'),
          dest: '__target__',
        },
        {
          src: path.join(__dirname, './pr/test'),
          dest: 'test',
        },
      ],
    });

    await mockGitHub.setup();
  });

  afterEach(async () => {
    await mockGitHub.teardown();
  });

  it('should remove label if specified', async () => {
    const { runEvent } = await mockGitHub.configure((act) =>
      act.setEvent({
        pull_request: {
          number: 1,
          head: {
            ref: 'pr',
          },
          base: {
            ref: 'main',
          },
        },
      }),
    );

    const result = await runEvent('pull_request', {
      logFile: 'label-specified.log',
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(successStep('Main Test compare')),
        expect.objectContaining(
          successStep('Main Remove label if specified', 'label'),
        ),
      ]),
    );
  });
});

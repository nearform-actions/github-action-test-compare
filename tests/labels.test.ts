import path from 'path';
import {
  createMockGitHub,
  MockGitHub,
  failureStep,
  successStep,
} from './utils';

describe.only('github-action-test-compare', () => {
  let mockGitHub: MockGitHub;

  beforeEach(async () => {
    mockGitHub = createMockGitHub({
      files: [
        {
          src: path.join(__dirname, './branches/label'),
          dest: '.',
        },
      ],
    });

    await mockGitHub.setup();
  });

  afterEach(async () => {
    await mockGitHub.teardown();
  });

  it.skip('should not remove label if none specified', async () => {
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
      logFile: 'label-unspecified.log',
    });

    const removeLabelStep = result.find(
      (step) => step.name === 'Remove label if specified',
    );

    expect(removeLabelStep).toBeUndefined();
  });

  it('should remove label if specified', async () => {
    const { runEvent } = await mockGitHub.configure((act) =>
      act.setInput('label', 'label').setEvent({
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

    console.log({ result });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(successStep('Remove label if specified')),
      ]),
    );
  });
});

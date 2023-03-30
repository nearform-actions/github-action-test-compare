import path from 'path';
import { createMockGitHub, isErrored, MockGitHub, successStep } from './utils';

describe.skip('github-action-test-compare', () => {
  let mockGitHub: MockGitHub;

  beforeEach(async () => {
    mockGitHub = createMockGitHub({
      files: [
        {
          src: path.join(__dirname, './branches/label'),
          dest: '.github/workflows',
        },
        {
          src: path.join(__dirname, './branches/pr-production/test'),
          dest: 'test',
        },
      ],
    });

    await mockGitHub.setup();
  });

  afterEach(async () => {
    await mockGitHub.teardown();
  });

  it('should not remove label if none specified', async () => {
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

    if (isErrored(result)) {
      return;
    }

    const removeLabelStep = result.find(
      (step) => step.name === 'Remove label if specified',
    );

    expect(removeLabelStep).toBeUndefined();
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
      workflowFile: (repoPath) => `${repoPath}/.github/workflows/label.yml`,
    });

    if (isErrored(result)) {
      return;
    }

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(
          successStep('Main Remove label if specified', 'label'),
        ),
      ]),
    );
  });
});

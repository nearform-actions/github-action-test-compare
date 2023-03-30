import { createMockGitHub, MockGitHub, failureStep, isErrored } from './utils';

describe('github-action-test-compare', () => {
  let mockGitHub: MockGitHub;

  beforeEach(async () => {
    mockGitHub = createMockGitHub();
    await mockGitHub.setup();
  });

  afterEach(async () => {
    await mockGitHub.teardown();
  });

  it('should return error for no target branch available', async () => {
    const act = await mockGitHub.configure((act) =>
      act.setEvent({
        pull_request: {
          head: {
            ref: 'pr',
          },
          base: {
            ref: '',
          },
        },
      }),
    );

    const result = await act.runEvent('pull_request', {
      logFile: 'missing-tests-no-target-branch.log',
    });

    if (isErrored(result)) {
      return;
    }

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(failureStep('Main Test compare')),
        expect.objectContaining(failureStep('Main Check target branch')),
      ]),
    );
  });

  it('should return error for no tests folder available', async () => {
    const act = await mockGitHub.configure((act) =>
      act.setEvent({
        pull_request: {
          head: {
            ref: 'pr',
          },
          base: {
            ref: 'main',
          },
        },
      }),
    );

    const result = await act.runEvent('pull_request', {
      logFile: 'missing-tests-no-tests-folder.log',
    });

    if (isErrored(result)) {
      return;
    }

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(failureStep('Main Test compare')),
        expect.objectContaining(
          failureStep(
            'Main Copy tests',
            `cp: cannot stat 'test': No such file or directory`,
          ),
        ),
      ]),
    );
  });
});

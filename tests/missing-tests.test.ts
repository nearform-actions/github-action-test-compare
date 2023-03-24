import { createMockGitHub, MockGitHub, failedStep } from './utils';

describe('github-action-test-compare', () => {
  let mockGitHub: MockGitHub;

  beforeEach(async () => {
    mockGitHub = createMockGitHub();
    await mockGitHub.setup();
  });

  afterEach(async () => {
    await mockGitHub.teardown();
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

    const result = await act.runEvent('pull_request');

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(failedStep('Main Test compare')),
        expect.objectContaining(
          failedStep(
            'Main Copy tests',
            `cp: cannot stat 'test': No such file or directory`,
          ),
        ),
      ]),
    );
  });
});

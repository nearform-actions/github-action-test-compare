import { createMockGitHub, MockGitHub, failedStep, successStep } from './utils';

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
      failedStep(
        'Main Copy tests',
        `cp: cannot stat 'test': No such file or directory`,
      ),
      successStep('Post Test compare'),
    ]);
  });
});

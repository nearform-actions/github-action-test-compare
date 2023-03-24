import { createMockGitHub, MockGitHub, failureStep } from './utils';

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
            ref: '',
          },
          base: {
            ref: 'pr',
          },
        },
      }),
    );

    const result = await act.runEvent('pull_request');

    console.log(
      result.map((step) => ({ name: step.name, output: step.output })),
    );

    expect(result).toEqual([]);
  });

  it('should return error for no tests folder available', async () => {
    const act = await mockGitHub.configure((act) =>
      act.setEvent({
        pull_request: {
          head: {
            ref: 'main',
          },
          base: {
            ref: 'pr',
          },
        },
      }),
    );

    const result = await act.runEvent('pull_request');

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

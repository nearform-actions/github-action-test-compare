import path from 'path';
import { createMockGitHub, MockGitHub, failedStep, successStep } from './utils';

describe('github-action-test-compare', () => {
  let mockGitHub: MockGitHub;

  beforeEach(async () => {
    mockGitHub = createMockGitHub({
      files: [
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

  it('should return action success if the tests fail due to tests touching production code', async () => {
    const { runEvent } = await mockGitHub.configure((act) =>
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

    const result = await runEvent('pull_request', {
      logFile: 'failing-tests.log',
    });

    expect(
      result.map((step) => ({ name: step.name, status: step.status })),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining(failedStep('Main Test compare')),
        expect.objectContaining(successStep('Main Install')),
        expect.objectContaining(failedStep('Main Run tests')),
      ]),
    );
  });
});

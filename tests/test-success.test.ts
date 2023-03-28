import path from 'path';
import {
  createMockGitHub,
  MockGitHub,
  failureStep,
  successStep,
} from './utils';

describe('github-action-test-compare', () => {
  let mockGitHub: MockGitHub;

  beforeEach(async () => {
    mockGitHub = createMockGitHub({
      files: [
        {
          src: path.join(__dirname, './branches/pr-non-production/test'),
          dest: 'test',
        },
      ],
    });

    await mockGitHub.setup();
  });

  afterEach(async () => {
    await mockGitHub.teardown();
  });

  it('should return action failure if the tests succeed due to tests not touching production code', async () => {
    const pullRequestNumber = 1;

    const { runEvent } = await mockGitHub.configure((act) =>
      act.setEvent({
        pull_request: {
          number: pullRequestNumber,
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
      logFile: 'success-tests.log',
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(failureStep('Main Test compare action')),
        expect.objectContaining(successStep('Main Copy tests')),
        expect.objectContaining(successStep('Main Install')),
        expect.objectContaining(successStep('Main Run tests')),
        expect.objectContaining(
          successStep('Main Find comment', pullRequestNumber.toString()),
        ),
        expect.objectContaining(
          successStep(
            'Main Create or update comment',
            `success ${pullRequestNumber}`,
          ),
        ),
        expect.objectContaining(
          failureStep('Main Check test success, fail action'),
        ),
      ]),
    );
  });
});

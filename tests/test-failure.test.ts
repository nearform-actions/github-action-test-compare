import path from 'path';
import {
  createMockGitHub,
  MockGitHub,
  failureStep,
  successStep,
} from './utils';

describe.skip('github-action-test-compare', () => {
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
      logFile: 'failure-tests.log',
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(successStep('Main Test compare')),
        expect.objectContaining(successStep('Main Install')),
        expect.objectContaining(failureStep('Main Run tests')),
      ]),
    );
  });
});

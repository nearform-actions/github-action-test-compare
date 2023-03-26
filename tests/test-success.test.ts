import { Moctokit } from '@kie/mock-github';
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

    const moctokit = new Moctokit(undefined, true);

    const result = await runEvent('pull_request', {
      logFile: 'success-tests.log',
      mockApi: [
        moctokit.rest.repos
          .get({
            owner: 'owner',
            repo: 'test',
          })
          .setResponse({ status: 200, data: {} }),
        moctokit.rest.issues
          .listComments({
            owner: 'owner',
            repo: 'repo',
            issue_number: 0,
          })
          .reply({
            status: 200,
            data: [
              {
                id: 0,
                node_id: 'MDEyOklzc3VlQ29tbWVudDE=',
                url: 'https://api.github.com/repos/owner/test/issues/comments/0',
                html_url:
                  'https://github.com/owner/test/issues/0#issuecomment-1',
                body: 'Test compare',
                user: {
                  login: 'github-action-test-compare[bot]',
                  id: 1,
                  node_id: 'MDQ6VXNlcjE=',
                  avatar_url:
                    'https://github.com/images/error/octocat_happy.gif',
                  gravatar_id: '',
                  url: 'https://api.github.com/users/octocat',
                  html_url: 'https://github.com/octocat',
                  followers_url:
                    'https://api.github.com/users/octocat/followers',
                  following_url:
                    'https://api.github.com/users/octocat/following{/other_user}',
                  gists_url:
                    'https://api.github.com/users/octocat/gists{/gist_id}',
                  starred_url:
                    'https://api.github.com/users/octocat/starred{/owner}{/repo}',
                  subscriptions_url:
                    'https://api.github.com/users/octocat/subscriptions',
                  organizations_url:
                    'https://api.github.com/users/octocat/orgs',
                  repos_url: 'https://api.github.com/users/octocat/repos',
                  events_url:
                    'https://api.github.com/users/octocat/events{/privacy}',
                  received_events_url:
                    'https://api.github.com/users/octocat/received_events',
                  type: 'User',
                  site_admin: false,
                },
                created_at: '2011-04-14T16:00:49Z',
                updated_at: '2011-04-14T16:00:49Z',
                issue_url: 'https://api.github.com/repos/owner/test/issues/0',
                author_association: 'COLLABORATOR',
              },
            ],
          }),
      ],
    });

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining(failureStep('Main Test compare')),
        expect.objectContaining(successStep('Main Install')),
        expect.objectContaining(failureStep('Main Run tests')),
      ]),
    );
  });
});

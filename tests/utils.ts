import path from 'path';
import { CreateRepositoryFile, MockGithub } from '@kie/mock-github';
import { Act, RunOpts, Step } from '@kie/act-js';

export type ConfiguredAct = {
  runEvent: (event: string, opts?: RunOpts | undefined) => Promise<Step[]>;
};

export type MockGitHub = {
  setup: () => Promise<void>;
  teardown: () => Promise<void>;
  configure: (factory?: (act: Act) => Act) => Promise<ConfiguredAct>;
};

function logActOutput(logFile: string) {
  return process.env.ACT_LOG
    ? { logFile: path.join(process.cwd(), logFile) }
    : {};
}

export function createMockGitHub({
  files = [],
}: {
  files?: CreateRepositoryFile[];
} = {}): MockGitHub {
  const mainFiles = [
    {
      src: path.resolve(__dirname, './branches/main'),
      dest: '.',
    },
    {
      src: path.resolve(__dirname, '..', 'action.yml'),
      dest: '/action.yml',
    },
    {
      src: path.resolve(__dirname, './branches/main'),
      dest: '__target__',
    },
    {
      src: path.resolve(__dirname, '..', 'action.yml'),
      dest: '__target__/action.yml',
    },
  ];

  const mockGitHub = new MockGithub({
    repo: {
      'owner/test': {
        files: [...mainFiles, ...files],
      },
    },
  });

  return {
    setup: () => mockGitHub.setup(),
    teardown: () => mockGitHub.teardown(),
    configure: async (factory: (act: Act) => Act = (act) => act) => {
      const repoPath = mockGitHub.repo.getPath('owner/test');

      if (!repoPath) {
        throw new Error('No mock GitHub repo path found.');
      }

      const act = new Act(repoPath);
      const parentDirectory = path.dirname(repoPath);

      const configuredAct = factory(
        act
          //   .setGithubToken('token')
          .setEnv('GITHUB_SERVER_URL', `${parentDirectory}${path.sep}`)
          .setEnv('GITHUB_REPOSITORY', 'owner/test'),
      );

      return {
        runEvent: (event: string, options: RunOpts = {}) => {
          const { logFile, ...rest } = options;

          return configuredAct.runEvent(event, {
            ...(logFile ? logActOutput(logFile) : {}),
            ...rest,
          });
        },
      };
    },
  };
}

export function successStep(name: string, output?: string) {
  return {
    name,
    ...(output ? { output } : {}),
    status: 0,
  };
}

export function failureStep(name: string, output?: string) {
  return {
    name,
    ...(output ? { output } : {}),
    status: 1,
  };
}

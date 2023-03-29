import path from 'path';
import { CreateRepositoryFile, MockGithub } from '@kie/mock-github';
import { Act, RunOpts, Step } from '@kie/act-js';

export type ConfiguredAct = {
  runEvent: (
    event: string,
    opts?: RunEventOptions | undefined,
  ) => Promise<Step[]>;
};

export type MockGitHub = {
  setup: () => Promise<void>;
  teardown: () => Promise<void>;
  configure: (factory?: (act: Act) => Act) => Promise<ConfiguredAct>;
};

export type RunEventOptions = Omit<RunOpts, 'workflowFile'> & {
  workflowFile?: (repoPath: string) => string;
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
  const mockGitHub = new MockGithub({
    repo: {
      'owner/test': {
        files: [
          {
            src: path.resolve(__dirname, '..', 'action.yml'),
            dest: '/action.yml',
          },
          ...files,
        ],
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
          .setEnv('GITHUB_SERVER_URL', `${parentDirectory}${path.sep}`)
          .setEnv('GITHUB_REPOSITORY', 'owner/test'),
      );

      return {
        runEvent: (event: string, options: RunEventOptions = {}) => {
          const { logFile, workflowFile, ...rest } = options;

          return configuredAct.runEvent(event, {
            ...(logFile ? logActOutput(logFile) : {}),
            workflowFile: workflowFile ? workflowFile(repoPath) : undefined,
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

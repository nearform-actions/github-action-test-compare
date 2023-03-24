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
      testAction: {
        files: [...mainFiles, ...files],
      },
    },
  });

  return {
    setup: () => mockGitHub.setup(),
    teardown: () => mockGitHub.teardown(),
    configure: async (factory: (act: Act) => Act = (act) => act) => {
      const act = new Act(mockGitHub.repo.getPath('testAction'));
      const configuredAct = factory(act.setGithubToken('token'));

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

export function failedStep(name: string, output?: string) {
  return {
    name,
    ...(output ? { output } : {}),
    status: 1,
  };
}

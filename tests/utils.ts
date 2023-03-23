import path from 'path';
import {
  CreateRepositoryFile,
  GitActionTypes,
  MockGithub,
} from '@kie/mock-github';
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
  ];

  const mockGitHub = new MockGithub({
    repo: {
      testAction: {
        pushedBranches: ['target', 'pull-request'],
        currentBranch: 'pull-request',
        history: [
          {
            action: GitActionTypes.PUSH,
            branch: 'target',
            files: mainFiles,
          },
          {
            action: GitActionTypes.MERGE,
            head: 'target',
            base: 'pull-request',
          },
          {
            action: GitActionTypes.PUSH,
            branch: 'pull-request',
            files,
          },
        ],
        // pushedBranches: ['main', 'pr'],
        // history: [
        //   {
        //     action: GitActionTypes.PUSH,
        //     branch: 'main',
        //     files: [
        //       {
        //         src: path.join(__dirname, 'action-test.yml'),
        //         dest: '.github/workflows/test.yml',
        //       },
        //       {
        //         src: path.resolve(__dirname, '..', 'action.yml'),
        //         dest: '/action.yml',
        //       },
        //     ],
        //   },
        //   {
        //     action: GitActionTypes.PUSH,
        //     branch: 'pr',
        //     files: [
        //       {
        //         src: path.resolve(__dirname, '..', 'action.yml'),
        //         dest: '/test/action.yml',
        //       },
        //     ],
        //   },
        //],
      },
    },
  });

  return {
    setup: () => mockGitHub.setup(),
    teardown: () => mockGitHub.teardown(),
    configure: async (factory: (act: Act) => Act = (act) => act) => {
      const act = new Act(mockGitHub.repo.getPath('testAction'));
      const configuredAct = factory(act.setGithubToken('token'));

      const repoPath = mockGitHub.repo.getPath('testAction');

      if (!repoPath) {
        throw new Error('No mock GitHub repo path found.');
      }

      const parentDir = path.dirname(repoPath);

      return {
        runEvent: (event: string, options: RunOpts = {}) => {
          const { logFile, ...rest } = options;

          console.log(logActOutput(logFile ?? ''));

          return configuredAct.runEvent(event, {
            // cwd: parentDir,
            // workflowFile: path.join(
            //   repoPath,
            //   '.github/workflows/action-test.yml',
            // ),
            // bind: true,
            ...(logFile ? logActOutput(logFile) : {}),
            ...rest,
          });
        },
      };
    },
  };
}

export function successStep(name: string, output: string = '') {
  return {
    name,
    output,
    status: 0,
  };
}

export function failedStep(name: string, output: string = '') {
  return {
    name,
    output,
    status: 1,
  };
}

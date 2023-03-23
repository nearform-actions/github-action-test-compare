import path from 'path';
import {
  CreateRepositoryFile,
  GitActionTypes,
  MockGithub,
} from '@kie/mock-github';
import { Act } from '@kie/act-js';

export type MockGitHub = {
  setup: () => Promise<void>;
  teardown: () => Promise<void>;
  act: () => Promise<Act>;
};

export function createMockGitHub({
  files = [],
}: {
  files?: CreateRepositoryFile[];
} = {}): MockGitHub {
  const mockGitHub = new MockGithub({
    repo: {
      testAction: {
        files: [
          {
            src: path.resolve(__dirname, './branches/main'),
            dest: '.',
          },
          {
            src: path.resolve(__dirname, '..', 'action.yml'),
            dest: '/action.yml',
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
    act: async () => {
      const act = new Act(mockGitHub.repo.getPath('testAction'));
      return act.setGithubToken('token');
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

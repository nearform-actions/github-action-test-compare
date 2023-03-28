# github-action-test-compare

**Compare tests against production**

This GitHub Action automatically runs the tests within a PR against the target branch and adds a warning comment to the PR if the tests pass. This action can be used to determine if tests added or modified actually test production changes within the same PR.

The action runs the following process:

- Checks out the PR branch
- Checks out the target branch into a target folder (`targetFolder`)
- Copies the PR tests (`tests`) to the target folder
- Installs dependencies (`installCommand`) and executes the tests (`testCommand`) in the target folder
- Warns if tests pass within the target folder
- Optionally removes a specified label (`label`) from the PR

## Usage

### Basic

`./github/workflows/test-compare.yml`

```yml
name: Test compare
on: [pull_request]

jobs:
  run:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Test compare
        uses: nearform-actions/github-action-test-compare@v1
```

### Run on PR label

```yml
name: Test compare
on:
  pull_request:
    types: [opened, reopened, synchronize, labeled]

jobs:
  run:
    if: contains(github.event.pull_request.labels.*.name, 'test-compare')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Test compare
        uses: nearform-actions/github-action-test-compare@v1
        with:
          label: test-compare # automatically remove label on completion
```

## Inputs

| Input            | Description                               | Required | Default       |
| ---------------- | ----------------------------------------- | -------- | ------------- |
| `targetFolder`   | The folder for the target branch checkout | No       | `__target__`  |
| `installCommand` | Install command for target branch         | No       | `npm install` |
| `testCommand`    | Test command for target branch            | No       | `npm test`    |
| `tests`          | Root test folder to copy to target folder | No       | `test`        |
| `label`          | Label to remove on action completion      | No       |               |

## Maintenance

This is a [composite GitHub Action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action) tested with [act-js](https://github.com/kiegroup/act-js) and [Mock GitHub](https://github.com/kiegroup/mock-github).

When running tests locally with `npm test`, you must have [Act](https://github.com/nektos/act) installed and available at `/usr/local/bin/act`.

You can enable Act logging with `npm run test:log` - the output is written to `.log` files in the root folder.

You can run only changed tests with `npm run test:changed` or `npm run test:changed:log`.

# github-action-test-compare

Compare tests against production

## Basic usage

#### ./github/workflows/test-compare.yml

```yml
name: Test compare
on: pull_request

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

## Run on PR label

#### ./github/workflows/test-compare.yml

```yml
name: Test compare
on:
  pull_request:
    types: [opened, reopened, synchronize, labeled, unlabeled]

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

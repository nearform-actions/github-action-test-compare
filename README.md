# github-action-test-compare

Compare tests against production

#### ./github/workflows/test-compare.yml

```yml
name: Test compare
on:
  pull_request:
    types: [opened, reopened, synchronize, labeled, unlabeled]

jobs:
  run:
    if: contains(github.event.pull_request.labels.*.name, 'performance')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Test compare
        uses: nearform-actions/github-action-test-compare@v1
        with:
          tests: __tests__
```

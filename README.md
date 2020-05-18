[![build-test](https://github.com/tony84727/changed-file-filter/workflows/build-test/badge.svg)](https://github.com/tony84727/changed-file-filter/actions)

# changed-file-filter

Determine changed files between base and current(head) commits.

## Usage

The action accepts filter rules in the YAML format. Each filter rule is a list of glob expressions. The action will create corresponding output variables to indicate if there's a changed file match the glob expressions. You can use those variables in the `if` clause to run specific jobs/steps when specific files changed.

```yaml
...
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: tony84727/changed-file-filter@0.0.2
      id: filter
      with:
        # head: optional head commit SHA, default to ${{ github.event.pull_request.head.sha || github.sha }}
        # base: optional base commit SHA, default to ${{ github.event.pull_request.base.sha }} or HEAD^ if not triggered by pull_request
        
        # filter rules in YAML format
        # <rule-name>:
        #  - <glob expression>
        filters: |
          doc:
            - 'doc/**/*'
          cc:
            - 'cc/**/*'
    # decide if to run a job based on variables outputted by the change filter
    - name: Test
      # get the variables by steps.<step id>.outputs.<rulename>
      if: steps.filter.outputs.cc == 'true'
      run: make test
    - name: Test Doc
      if: steps.filter.outputs.doc == 'true'
      run: ./doc/test.sh
```

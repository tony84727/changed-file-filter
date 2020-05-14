import {newGlobber} from '../src/glob'

describe('globber returned by newGlobber', () => {
  interface GlobberTestCase {
    globRules: string[]
    expectedMatches: [string, boolean][]
  }
  const testCases: GlobberTestCase[] = [
    {
      globRules: ['**/*.go', '__tests__/**/*.test.ts'],
      expectedMatches: [
        ['main.go', true],
        ['deep/main.go', true],
        ['shallow.ts', false],
        ['__tests__/main.ts', false],
        ['__tests__/main.test.ts', true]
      ]
    },
    {
      globRules: ['BUILD', '**/BUILD.bazel'],
      expectedMatches: [
        ['BUILD', true],
        ['src/BUILD.bazel', true],
        ['src/pkg/BUILD.bazel', true],
        ['src/BUILD', false],
        ['BUILD.bazel', true]
      ]
    }
  ]
  it('matches paths correclty', () => {
    for (const testCase of testCases) {
      const globber = newGlobber(testCase.globRules)
      for (const [input, match] of testCase.expectedMatches) {
        const testMessage = `${input} ${match ? 'should' : "shouldn't"} match ${
          testCase.globRules
        }`
        expect(globber(input), testMessage).toEqual(match)
      }
    }
  })
})

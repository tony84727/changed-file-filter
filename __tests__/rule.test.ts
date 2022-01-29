import {parseRules} from '../src/rule'
import fs from 'fs'

/**
 * @group unit
 */
describe('parseRules', () => {
  it('parses yaml', () => {
    const ruleYaml = fs.readFileSync('testdata/rules.yaml')
    const rules = parseRules(ruleYaml.toString())
    expect(rules).toEqual([
      {
        name: 'go',
        match: ['**/*.go']
      },
      {
        name: 'js',
        match: ['**/*.ts']
      },
      {
        name: 'build',
        match: ['**/Dockerfile', '**/bazel.BUILD', '**/BUILD']
      }
    ])
  })

  it('throws an error if rule is not a string array', () => {
    expect(() => {
      parseRules(`
go:
  - 1
`)
    }).toThrow()
    expect(() => {
      parseRules(`
go:
  name: helloworld`)
    }).toThrow()
  })
})

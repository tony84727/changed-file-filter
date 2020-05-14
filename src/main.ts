import * as core from '@actions/core'
import {getChangedFiles, unshallow} from './git'
import {Rule, parseRules} from './rule'
import {newGlobber} from './glob'
function evaluateRule(rule: Rule, changedFiles: string[]): boolean {
  const globber = newGlobber(rule.match)
  return changedFiles.find(globber) !== undefined
}
async function run(): Promise<void> {
  try {
    const baseSha = core.getInput('base')
    const headSha = core.getInput('head')
    core.debug(`baseSha: ${baseSha}`)
    core.debug(`headSha: ${headSha}`)
    await unshallow()

    const rules = parseRules(core.getInput('filters'))
    const changedFiles = await getChangedFiles(baseSha, headSha)
    core.debug(`changedFiles: ${changedFiles}`)
    for (const r of rules) {
      const changed = evaluateRule(r, changedFiles) ? 'true' : 'false'
      core.debug(`rule: ${r.name}, changed: ${changed}`)
      core.setOutput(r.name, changed)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

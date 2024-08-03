import * as core from '@actions/core'
import {Rule, parseRules} from './rule'
import {getChangedFiles, revParse} from './git'
import {newGlobber} from './glob'
function evaluateRule(rule: Rule, changedFiles: string[]): string[] {
  const globber = newGlobber(rule.match)
  return changedFiles.filter(globber)
}

async function getBaseSha(event: string): Promise<string> {
  if (event === 'push') {
    return revParse('HEAD^')
  }
  return core.getInput('base')
}

async function getHeadSha(): Promise<string> {
  const headRef = core.getInput('head-ref')
  if (headRef.length > 0) {
    return revParse(headRef)
  }
  return core.getInput('head')
}

async function run(): Promise<void> {
  try {
    const event = core.getInput('event')
    const baseSha = await getBaseSha(event)
    const headSha = await getHeadSha()
    core.debug(`baseSha: ${baseSha}`)
    core.debug(`headSha: ${headSha}`)

    const rules = parseRules(core.getInput('filters'))
    const changedFiles = await getChangedFiles(baseSha, headSha)
    core.debug(`changedFiles: ${changedFiles}`)
    for (const r of rules) {
      const matchedFiles = evaluateRule(r, changedFiles)
      const changed = matchedFiles.length > 0 ? 'true' : 'false'
      core.debug(`rule: ${r.name}, changed: ${changed}`)
      core.setOutput(r.name, changed)
      core.setOutput(`${r.name}_files`, matchedFiles.join(' '))
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()

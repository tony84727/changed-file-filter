import * as core from '@actions/core'
import {getChangedFiles, unshallow, revParse, getMergeBase} from './git'
import {Rule, parseRules} from './rule'
import {newGlobber} from './glob'
function evaluateRule(rule: Rule, changedFiles: string[]): boolean {
  const globber = newGlobber(rule.match)
  return changedFiles.find(globber) !== undefined
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

async function resolveMergeBase(
  event: string,
  baseSha: string,
  headSha: string
): Promise<string> {
  if (event === 'pull_request') {
    return await getMergeBase(baseSha, headSha)
  }
  return core.getInput('base')
}

async function run(): Promise<void> {
  try {
    const event = core.getInput('event')
    await unshallow()
    const branchBaseSha = await getBaseSha(event)
    const headSha = await getHeadSha()
    const mergeBase = await resolveMergeBase(event, branchBaseSha, headSha)
    core.debug(`brancBaseSha: ${branchBaseSha}`)
    core.debug(`headSha: ${headSha}`)
    core.debug(`mergeBase: ${mergeBase}`)

    const rules = parseRules(core.getInput('filters'))
    const changedFiles = await getChangedFiles(mergeBase, headSha)
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

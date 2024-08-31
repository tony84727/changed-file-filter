import {exec, getExecOutput} from '@actions/exec'

async function execForStdOut(
  commandLine: string,
  args?: string[],
  cwd?: string
): Promise<string> {
  const output = await getExecOutput(commandLine, args, {cwd})
  return output.stdout
}
async function getMergeBase(
  shaA: string,
  shaB: string,
  cwd?: string
): Promise<string> {
  return execForStdOut('git', ['merge-base', shaA, shaB], cwd)
}

export async function getChangedFiles(
  baseSha: string,
  headSha: string,
  cwd?: string
): Promise<string[]> {
  const mergeBase = (await getMergeBase(baseSha, headSha, cwd)).trim()
  return (
    await execForStdOut(
      'git',
      ['diff', '--name-only', `${mergeBase}..${headSha}`, '--'],
      cwd
    )
  )
    .split('\n')
    .map(x => x.trim())
    .filter(x => x.length > 0)
}

export async function revParse(rev: string, cwd?: string): Promise<string> {
  const output = await execForStdOut('git', ['rev-parse', rev], cwd)
  return output.trim()
}

export async function unshallowHistories(): Promise<number> {
  return exec('git', ['fetch', '--prune', '--unshallow', '--filter=blob:none'])
}

import {exec} from '@actions/exec'

async function execForStdOut(
  commandLine: string,
  args?: string[],
  cwd?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      exec(commandLine, args, {
        cwd,
        listeners: {
          stdout: buffer => resolve(buffer.toString())
        }
        // eslint-disable-next-line github/no-then
      }).catch(reject)
    } catch (err) {
      reject(err)
    }
  })
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

export async function unshallow(): Promise<number> {
  return exec('git', ['fetch', '--prune', '--unshallow'])
}

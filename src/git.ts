import {exec} from '@actions/exec'

export async function getChangedFiles(
  baseSha: string,
  headSha: string,
  cwd?: string
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    try {
      exec('git', ['diff', '--name-only', `${baseSha}..${headSha}`, '--'], {
        cwd,
        listeners: {
          stdout: buffer =>
            resolve(
              buffer
                .toString()
                .split('\n')
                .map(x => x.trim())
                .filter(x => x.length > 0)
            )
        }
      }).catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}

export async function revParse(rev: string, cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      exec('git', ['rev-parse', rev], {
        cwd,
        listeners: {
          stdout: buffer => resolve(buffer.toString().trim())
        }
      }).catch(reject)
    } catch (err) {
      reject(err)
    }
  })
}

export async function unshallow(): Promise<number> {
  return exec('git', ['fetch', '--prune', '--unshallow'])
}

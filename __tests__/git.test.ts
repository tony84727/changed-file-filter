import {exec} from '@actions/exec'
import {promisify} from 'util'
import {writeFile as nodeWriteFile} from 'fs'
import path from 'path'
import {getChangedFiles, revParse} from '../src/git'
import tmp from 'tmp'
import process from 'process'

/**
 * git integration test
 *
 * @group integration
 */
describe('getChangedFiles', () => {
  it('returns changed files between commits', async () => {
    const writeFile = promisify(nodeWriteFile)
    const {name: testzone} = tmp.dirSync()
    const gitEnvVars = {
      ...process.env,
      // some env vars to prevent git from reading system-wide/user config options that might
      // interfere the testing
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_NOGLOBAL: '1',
      GIT_CONFIG_SYSTEM: '/dev/null',
      GIT_CONFIG_GLOBAL: '/dev/null'
    }
    async function execGit(args: string[]) {
      return exec('git', args, {cwd: testzone, env: gitEnvVars})
    }
    await execGit(['init'])
    await execGit(['config', 'user.name', 'Github.Action'])
    await execGit(['config', 'user.email', 'action@github.com'])
    const writeAndCommitFile = async (
      filepath: string,
      fileContent: string,
      commitMessage: string
    ) => {
      await writeFile(path.join(testzone, filepath), fileContent)
      await execGit(['add', filepath])
      await execGit(['commit', '-m', commitMessage])
      return revParse('HEAD', testzone)
    }
    const firstCommit = await writeAndCommitFile(
      'frist',
      'first file',
      'add first'
    )
    const secondCommit = await writeAndCommitFile(
      'second',
      'second file',
      'add second'
    )
    const thirdCommit = await writeAndCommitFile(
      'third',
      'third file',
      'add third'
    )
    expect(await getChangedFiles(firstCommit, secondCommit, testzone)).toEqual([
      'second'
    ])
    expect(await getChangedFiles(secondCommit, thirdCommit, testzone)).toEqual([
      'third'
    ])
    expect(await getChangedFiles(firstCommit, thirdCommit, testzone)).toEqual([
      'second',
      'third'
    ])
  })
})

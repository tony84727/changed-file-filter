import {exec} from '@actions/exec'
import {promisify} from 'util'
import {writeFile as nodeWriteFile} from 'fs'
import path from 'path'
import {getChangedFiles, revParse} from '../src/git'
import tmp from 'tmp'

describe('getChangedFiles', () => {
  it('returns changed files between commits', async () => {
    const writeFile = promisify(nodeWriteFile)
    const {name: testzone} = tmp.dirSync()
    await exec('git', ['init'], {cwd: testzone})
    await exec('git', ['config', 'user.name', 'Github.Action'], {cwd: testzone})
    await exec('git', ['config', 'user.email', 'action@github.com'], {
      cwd: testzone
    })
    const writeAndCommitFile = async (
      filepath: string,
      fileContent: string,
      commitMessage: string
    ) => {
      await writeFile(path.join(testzone, filepath), fileContent)
      await exec('git', ['add', filepath], {cwd: testzone})
      await exec('git', ['commit', '-m', commitMessage], {cwd: testzone})
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

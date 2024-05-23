import { jest } from '@jest/globals'
import NPM from './index.js'

describe('NPM', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test('`preBump` runs npm build cmd and logs version', async () => {
    const npm = new NPM({})
    jest
      .spyOn(npm, 'read')
      .mockResolvedValue(JSON.stringify({ version: '9.9.9' }))
    const execSpy = jest.spyOn(npm, 'exec').mockResolvedValue()
    const logSpy = jest.spyOn(npm, 'log')
    await npm.preBump()

    expect(execSpy).toHaveBeenCalledWith('npm run build')
    expect(logSpy).toHaveBeenCalledWith('Package version: 9.9.9')
  })

  test('supports custom build cmd', async () => {
    const npm = new NPM({
      buildCmd: 'npm run custom-build'
    })
    jest
      .spyOn(npm, 'read')
      .mockResolvedValue(JSON.stringify({ version: '9.9.9' }))
    const execSpy = jest.spyOn(npm, 'exec').mockResolvedValue()
    await npm.preBump()

    expect(execSpy).toHaveBeenCalledWith('npm run custom-build')
  })

  test('`bump` runs npm version cmd', async () => {
    const npm = new NPM({})
    jest.spyOn(npm, 'promptSelect').mockResolvedValue('patch')
    const execSpy = jest.spyOn(npm, 'exec').mockResolvedValue()
    await npm.bump()

    expect(execSpy).toHaveBeenCalledWith(
      'npm version patch  --git-tag-version=false'
    )
  })

  test('throws error for invalid prompt choice', async () => {
    const npm = new NPM({})
    jest
      .spyOn(npm, 'promptSelect')
      .mockResolvedValue('definitely-not-a-valid-version')
    jest.spyOn(npm, 'exec').mockResolvedValue()

    await expect(npm.bump()).rejects.toThrow(
      'Must select a valid release type for bump'
    )
  })

  test('supports pre-release choices with custom pre-release id', async () => {
    const expectedSubset = [
      {
        name: 'prepatch',
        value: 'prepatch',
        description: 'Prepatch'
      },
      {
        name: 'preminor',
        value: 'preminor',
        description: 'Preminor'
      },
      {
        name: 'premajor',
        value: 'premajor',
        description: 'Premajor'
      },
      {
        name: 'prerelease',
        value: 'prerelease',
        description: 'Prerelease'
      }
    ]
    const npm = new NPM({
      preReleaseId: 'alpha'
    })
    const promptSpy = jest.spyOn(npm, 'promptSelect').mockResolvedValue('patch')
    jest.spyOn(npm, 'exec').mockResolvedValue()
    await npm.bump()

    expect(promptSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(expectedSubset),
      ''
    )
  })

  test('supports custom version args', async () => {
    const npm = new NPM({
      versionArgs: '--custom-arg=foo'
    })
    jest.spyOn(npm, 'promptSelect').mockResolvedValue('patch')
    const execSpy = jest.spyOn(npm, 'exec').mockResolvedValue()
    await npm.bump()

    expect(execSpy).toHaveBeenCalledWith(
      'npm version patch --custom-arg=foo --git-tag-version=false'
    )
  })

  test('supports tag commit arg', async () => {
    const npm = new NPM({
      tagCommit: true
    })
    jest.spyOn(npm, 'promptSelect').mockResolvedValue('patch')
    const execSpy = jest.spyOn(npm, 'exec').mockResolvedValue()
    await npm.bump()

    expect(execSpy).toHaveBeenCalledWith(
      'npm version patch  --git-tag-version=true'
    )
  })

  test('`prePublish` logs version', async () => {
    const npm = new NPM({})
    jest
      .spyOn(npm, 'read')
      .mockResolvedValue(JSON.stringify({ version: '1.1.1' }))
    const logSpy = jest.spyOn(npm, 'log')
    await npm.prePublish()

    expect(logSpy).toHaveBeenCalledWith('Package version: 1.1.1')
  })

  test('`publish` runs npm publish cmd', async () => {
    const npm = new NPM({})
    const execSpy = jest.spyOn(npm, 'exec').mockResolvedValue()
    await npm.publish()

    expect(execSpy).toHaveBeenCalledWith('npm publish ')
  })

  test('supports custom publish args', async () => {
    const npm = new NPM({
      publishArgs: '--custom-arg=foo'
    })
    const execSpy = jest.spyOn(npm, 'exec').mockResolvedValue()
    await npm.publish()

    expect(execSpy).toHaveBeenCalledWith('npm publish --custom-arg=foo')
  })
})

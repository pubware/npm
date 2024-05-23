import semver, { ReleaseType } from 'semver'
import Plugin from '@pubware/plugin'

interface Config {
  tagCommit: boolean
  preReleaseId: string
  buildCmd: string
  versionArgs: string
  publishArgs: string
  defaults: {
    choice: string
  }
}

/**
 * Class representing an NPM plugin.
 * @extends Plugin
 */
class NPM extends Plugin {
  private config: Config

  /**
   * Create an instance of NPM.
   * @param {Partial<Config>} config Config for the plugin.
   */
  constructor(config: Partial<Config>) {
    super('npm')
    this.config = {
      tagCommit: config.tagCommit ?? false,
      preReleaseId: config.preReleaseId ?? '',
      buildCmd: config.buildCmd ?? 'npm run build',
      versionArgs: config.versionArgs ?? '',
      publishArgs: config.publishArgs ?? '',
      defaults: {
        choice: config.defaults?.choice ?? ''
      }
    }
  }

  /**
   * Read the version from the package.json file.
   * @returns {Promise<string>} The current package version.
   * @throws Throws an error if the package.json file cannot be parsed.
   */
  private async getPackageVersion(): Promise<string> {
    const data = await this.read('./package.json')

    try {
      const packageJson = JSON.parse(data)
      return packageJson.version
    } catch (err) {
      throw new Error('Failed to parse package json')
    }
  }

  /**
   * Log the current package version.
   */
  private async logVersion(): Promise<void> {
    const version = await this.getPackageVersion()
    this.log(`Package version: ${version}`)
  }

  /**
   * Execute the build command.
   */
  private async build(): Promise<void> {
    await this.exec(this.config.buildCmd)
  }

  /**
   * Check if the given version choice is semver valid.
   * @param {ReleaseType} version The version.
   * @returns {boolean} True if the version choice is valid, false otherwise.
   */
  private isValidSemverChoice(version: ReleaseType): boolean {
    return semver.RELEASE_TYPES.includes(version)
  }

  /**
   * Prompt the user to select a version bump type.
   * @returns {Promise<string>} The selected version bump type.
   * @throws Throws an error if an invalid release type is selected.
   */
  private async promptBump(): Promise<string> {
    let choices = [
      {
        name: 'patch',
        value: 'patch',
        description: 'Patch'
      },
      {
        name: 'minor',
        value: 'minor',
        description: 'Minor'
      },
      {
        name: 'major',
        value: 'major',
        description: 'Major'
      }
    ]

    if (this.config.preReleaseId) {
      const preReleaseChoices = [
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

      choices = [...choices, ...preReleaseChoices]
    }

    const choice = (await this.promptSelect(
      'What type of update do you want to perform?',
      choices,
      this.config.defaults.choice
    )) as ReleaseType

    if (!this.isValidSemverChoice(choice)) {
      throw new Error('Must select a valid release type for bump')
    }

    return choice
  }

  /**
   * Lifecycle pre-bump hook.
   * Build the package and log the version.
   * @returns {Promise<void>}
   */
  async preBump(): Promise<void> {
    await this.build()
    await this.logVersion()
  }

  /**
   * Lifecycle bump hook.
   * Bump the package version.
   * @returns {Promise<void>}
   */
  async bump(): Promise<void> {
    const version = await this.promptBump()
    const { versionArgs, tagCommit } = this.config
    await this.exec(
      `npm version ${version} ${versionArgs} ${
        tagCommit ? '--git-tag-version=true' : '--git-tag-version=false'
      }`
    )
  }

  /**
   * Lifecycle pre-publish hook.
   * Log package version.
   * @returns {Promise<void>}
   */
  async prePublish(): Promise<void> {
    await this.logVersion()
  }

  /**
   * Lifecycle publish hook.
   * Publish the package.
   * @returns {Promise<void>}
   */
  async publish(): Promise<void> {
    await this.exec(`npm publish ${this.config.publishArgs}`)
  }
}

export default NPM

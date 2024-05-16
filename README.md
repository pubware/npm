# 📦 npm

The `npm` plugin is responsible for bumping the package version and publishing to a registry.

Used internally with [packpub](https://github.com/packpub/packpub).

## Props

| Prop         | Type    | Description                               |
| ------------ | ------- | ----------------------------------------- |
| tagCommit    | boolean | Indicates if the commit should be tagged. |
| preReleaseId | string  | Identifier for the pre-release version.   |
| buildCmd     | string  | Command to build the project.             |
| versionArgs  | string  | Arguments for versioning.                 |
| publishArgs  | string  | Arguments for publishing.                 |
| defaults     | object  | Defaults.                                 |

## License

MIT

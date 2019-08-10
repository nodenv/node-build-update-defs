const Definition = require('./definition')

module.exports = class GraalDefinition extends Definition {
  static Binary (definition) {
    return ({ url, sha }) =>
      url.match(/\.tar\.gz$/)
        ? {
          platform: this.platformFrom(url),
          downloadUri: `${url}#${sha}`
        }
        : null
  }

  static platformFrom (url) {
    return {
      linux: 'linux-x64',
      macos: 'darwin-x64',
      darwin: 'darwin-x64'
    }[/-(macos|darwin|linux)-amd64/.exec(url)[1]]
  }

  get packageName () {
    return `${this.name}-${this.version}`
  }

  get install () {
    return `${super.install} graal`
  }
}

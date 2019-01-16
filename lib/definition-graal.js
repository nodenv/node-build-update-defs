const Definition = require('./definition')

module.exports = class GraalDefinition extends Definition {
  static Binary (definition) {
    return ({ url, sha }) => ({
      platform: this.platformFrom(url),
      downloadUri: `${url}#${sha}`
    })
  }

  static platformFrom (url) {
    return {
      linux: 'linux-x64',
      macos: 'darwin-x64'
    }[/-(macos|linux)-amd64/.exec(url)[1]]
  }

  get packageName () {
    return `${this.name}-${this.version}`
  }

  get install () {
    return `${super.install} graal`
  }
}

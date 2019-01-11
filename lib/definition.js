module.exports = class Definition {
  constructor (props) {
    Object.assign(this, props)

    if (!this.packageName && !this.binaries.length) {
      throw Error('no source or binaries')
    }
  }

  get preamble () {
    return this.packageName
      ? ''
      : 'echo "This package only contains compiled binaries."\n' +
          'echo "If no binary matches your platform, source compilation will not be attempted."\n'
  }

  get install () {
    return `install_package "${this.packageName || this.version}" "${
      this.downloadUri
    }"`
  }

  get postamble () {
    return ''
  }

  get downloadUri () {
    return `${this.url}#${this.shasum}`
  }

  get binarySet () {
    return (
      this.binaries
        .map(b => `binary ${b.platform} "${b.downloadUri}"`)
        .join('\n') + (this.binaries.length ? '\n' : '')
    )
  }

  toString () {
    return (
      []
        .concat(this.preamble, this.binarySet, this.install, this.postamble)
        .filter(i => i)
        .join('\n') + '\n'
    )
  }
}

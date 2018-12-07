module.exports = class Definition {
  constructor (props) {
    Object.assign(this, props)

    // TODO: only guard if missing both source and binaries
    // once we're able to build a binary-only package:
    // https://github.com/nodenv/node-build/issues/259
    if (!this.packageName) throw Error('skipping')
  }

  get preamble () {
    return ''
  }

  get install () {
    return `install_package "${this.packageName}" "${this.downloadUri}"`
  }

  get postamble () {
    return ''
  }

  get downloadUri () {
    return `${this.url}#${this.shasum}`
  }

  get binarySet () {
    return this.binaries.join('\n') + (this.binaries.length ? '\n' : '')
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

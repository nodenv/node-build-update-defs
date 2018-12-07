module.exports = class Definition {
  constructor (props) {
    Object.assign(this, props)

    if (!this.packageName && !this.binaries.length) {
      // return new NullBuild(props)
    }
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

  toString () {
    return [].concat(
      this.preamble,
      this.binaries,
      (this.binaries.length ? ' ' : ''),
      this.install,
      this.postamble).filter(i => i).join('\n') + '\n'
  }
}

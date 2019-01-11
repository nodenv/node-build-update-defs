const Definition = require('./definition')

class Binary {
  constructor (props) {
    Object.assign(this, props)
  }

  get url () {
    return `${this.baseUri}${this.version}/${this.packageName}.tar.gz`
  }

  get downloadUri () {
    return `${this.url}#${this.shasum}`
  }

  get platform () {
    return `${this.os}-${this.arch}`
  }
}

module.exports = class NodeDefinition extends Definition {
  constructor (...args) {
    super(...args)

    Binary.prototype.baseUri = this.baseUri
    this.binaries = this.binaries.map(bin => new Binary(bin))
  }

  get url () {
    return `${this.baseUri}${this.version}/${this.packageName}.tar.gz`
  }
}

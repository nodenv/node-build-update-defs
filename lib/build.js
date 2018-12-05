const fs = require('fs')
const path = require('path')

class Build {
  constructor (name, version) {
    this.name = name
    this.version = version
    this.binaries = []
    this.preamble = ''
    this.postamble = ''
    this.shasum = ''
  }

  get basename () {
    return `${this.name}-${this.version.replace(/v/, '')}`.replace(/node-/, '')
  }

  get definition () {
    // console.log("BINARIES", this.binaries[0].definition)
    var binaries =
      this.binaries.map(binary => binary.definition).join('\n') +
      (this.binaries.length ? '\n\n' : '')
    return this.preamble + binaries + this.install + this.postamble
  }

  get downloadUri () {
    return `${this.url}#${this.shasum}`
  }

  get install () {
    return ''
  }

  get url () {
    return ''
  }

  complete () {
    return Promise.resolve(this)
  }

  exists (dirs) {
    return dirs.some(dir => fs.existsSync(path.join(dir, this.basename)))
  }

  write (write) {
    return this.complete().then(
      build =>
        new Promise((resolve, reject) => {
          write(build.basename, build.definition, err => {
            if (err) return reject(err)

            console.log(build.basename, 'written')
            resolve(build)
          })
        })
    )
  }
}

class Binary {
  constructor (props) {
    Object.assign(this, props)
  }

  get definition () {
    return `binary ${this.platform} "${this.downloadUri}"`
  }

  get downloadUri () {
    return `${this.url}#${this.shasum}`
  }

  get platform () {
    return `${this.os}-${this.arch}`
  }
}

module.exports = { Build, Binary }

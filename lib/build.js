var fs = require('fs')
var format = require('util').format
var path = require('path')

module.exports = {
  name: '',
  version: '',
  binaries: [],
  preamble: '',
  install: '',
  postamble: '',
  url: '',
  shasum: '',
  patch: '',

  get basename () {
    return format('%s-%s', this.name, this.version.replace(/v/, '')).replace(/node-/, '')
  },

  get definition () {
    var binaries = this.binaries.map(function (binary) { return binary.definition }).join('\n') + (this.binaries.length ? '\n\n' : '')
    return this.preamble + binaries + this.install + this.postamble
  },

  get downloadUri () {
    return format('%s#%s', this.url, this.shasum)
  },

  get filename () {
    return path.join(this.path, this.basename)
  },

  complete: function () {
    return Promise.resolve(this)
  },

  exists: function (dirs) {
    return dirs.some(function (dir) {
      return fs.existsSync(path.join(dir, this.basename))
    }.bind(this))
  },

  write: function (build) {
    build = build || this

    return new Promise(function (resolve, reject) {
      fs.writeFile(build.filename, build.definition, function (err) {
        if (err) return reject(err)

        console.log(build.packageName + ' written')
        resolve(build)
      })
    })
  }
}

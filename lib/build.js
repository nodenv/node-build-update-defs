var fs = require('fs')
var format = require('util').format
var path = require('path')

module.exports = function () {
  return {
    Build: Build,
    Binary: Binary
  }
}

var Build = {
  name: '',
  version: '',
  binaries: [],
  preamble: '',
  install: '',
  postamble: '',
  url: '',
  shasum: '',

  get basename () {
    return format('%s-%s', this.name, this.version.replace(/v/, '')).replace(
      /node-/,
      ''
    )
  },

  get definition () {
    var binaries =
      this.binaries
        .map(function (binary) {
          return binary.definition
        })
        .join('\n') + (this.binaries.length ? '\n\n' : '')
    return this.preamble + binaries + this.install + this.postamble
  },

  get downloadUri () {
    return format('%s#%s', this.url, this.shasum)
  },

  complete: function () {
    return Promise.resolve(this)
  },

  exists: function (dirs) {
    return dirs.some(
      function (dir) {
        return fs.existsSync(path.join(dir, this.basename))
      }.bind(this)
    )
  },

  write: function (dest, write) {
    var build = this

    return new Promise(function (resolve, reject) {
      write(path.join(dest, build.basename), build.definition, function (err) {
        if (err) return reject(err)

        console.log(build.basename, 'written')
        resolve(build)
      })
    })
  }
}

var Binary = {
  get definition () {
    return format('binary %s "%s"', this.platform, this.downloadUri)
  },
  get downloadUri () {
    return format('%s#%s', this.url, this.shasum)
  },
  get platform () {
    return format('%s-%s', this.os, this.arch)
  }
}

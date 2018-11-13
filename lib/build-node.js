var format = require('util').format
var fetch = require('./fetch')
var Build = require('./build')().Build
var Binary = require('./build')().Binary
var NullBuild = require('./build-null')

module.exports = function (name, baseUri) {
  var BuildNode = Object.create(Build, {
    name: {
      value: name
    },
    install: {
      get: function () {
        return format(
          'install_package "%s" "%s"\n',
          this.packageName,
          this.downloadUri
        )
      }
    },
    url: {
      get: function () {
        return format('%s%s/%s.tar.gz', baseUri, this.version, this.packageName)
      }
    },
    complete: {
      value: function () {
        return new Promise(function (resolve) {
          setTimeout(resolve, Math.random() * 7000)
        })
          .then(fetch.bind(null, baseUri + this.version + '/SHASUMS256.txt'))
          .then(
            function (shasumData) {
              Object.assign(this, sourcePackage(shasumData))
              Object.assign(this, binaryPackages(shasumData))
              return this
            }.bind(this)
          )
          .then(function (build) {
            if (build.packageName || build.binaries.length) {
              return build
            }

            return NullBuild(build)
          })
      }
    }
  })

  var BinaryNode = Object.create(Binary, {
    url: {
      get: function () {
        return format('%s%s/%s.tar.gz', baseUri, this.version, this.packageName)
      }
    }
  })

  return {
    Build: BuildNode,
    Binary: BinaryNode
  }

  // private

  function sourcePackage (shasumData) {
    var result = shasumData.match(
      /^(\w{64}) {2}(?:\.\/)?(node-v\d+\.\d+\.\d+(?:-rc\.\d+)?)\.tar\.gz$/im
    )

    if (result) {
      return {
        shasum: result[1],
        packageName: result[2]
      }
    } else {
      console.warn('Missing source package')
    }
  }

  function binaryPackages (shasumData) {
    var matches = []
    var regex = new RegExp(
      /^(\w{64}) {2}(?:\.\/)?((?:node-(v\d+\.\d+\.\d+(?:-rc\.\d+)?))-([^.]+)-([^.]+))\.tar\.gz$/gim
    )

    var result
    while ((result = regex.exec(shasumData))) {
      matches.push(
        Object.assign(Object.create(BinaryNode), {
          shasum: result[1],
          packageName: result[2],
          version: result[3],
          os: result[4],
          arch: result[5]
        })
      )
    }
    return { binaries: matches }
  }
}

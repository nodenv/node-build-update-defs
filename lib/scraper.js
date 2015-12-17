var fs = require('fs')
var format = require('util').format
var https = require('https')
var Build = require('./build')
var fetch = require('./fetch')

module.exports = function getVersions (options) {
  fetch('https://iojs.org/dist/index.json').then(JSON.parse).then(function (distributions) {
    return distributions.map(function (build) {
      return Object.assign(Object.create(IojsBuild), {
        binaries: [],
        path: options.definitionPaths[0],
        version: build.version
      })
    })
    .filter(function (build) {
      return !build.exists(options.definitionPaths) || options.overwrite
    })
    .map(function (build) {
      return getChecksumsFile.bind(null, build, function (error, shasumData) {
        if (!error) {
          extractShasums(build, shasumData, writeFile)
        }
      })
    })
    .forEach(function (getChecksumsFile) {
      setTimeout(getChecksumsFile, Math.random() * 7000)
    })
  },
  function (e) { console.error('Error with distribution listing', e.message) })
}

// private

var IojsBuild = Object.create(Build, {
  name: {
    value: 'iojs'
  },
  baseUrl: {
    value: 'https://iojs.org/dist/'
  },
  install: {
    get: function () {
      return format('install_package "%s" "%s"\n', this.packageName, this.downloadUri)
    }
  },
  url: {
    get: function () {
      return format('%s%s/%s.tar.gz', this.baseUrl, this.version, this.packageName)
    }
  },
  shasumFileUri: {
    get: function () {
      return format('%s%s/SHASUMS256.txt', this.baseUrl, this.version)
    }
  }
})

var Binary = {
  get definition () {
    return format('binary %s "%s"', this.platform, this.downloadUri)
  },
  get downloadUri () {
    return format('%s%s/%s#%s', this.build.baseUrl, this.build.version, this.package, this.shasum)
  }
}

function getChecksumsFile (build, cb) {
  https.get(build.shasumFileUri, function (res) {
    if (res.statusCode !== 200) return this.emit('error', res)

    var shasumData = ''

    res
    .on('data', function (data) {
      shasumData = shasumData + data
    })
    .on('end', function () {
      cb(null, shasumData)
    })
    .on('error', this.emit.bind(this, 'error'))
  }).on('error', function (e) { console.error('Error with ', build.version, e.message) })
}

function extractShasums (build, shasumData, cb) {
  try {
    extractSourceChecksum(build, shasumData)
    extractBinaryChecksums(build, shasumData)
    cb(null, build)
  } catch (error) {
    cb(error)
  }
}

function extractSourceChecksum (build, shasumData) {
  var result = shasumData.match(/^(\w{64}) {2}(?:\.\/)?((?:node|iojs)-v\d+\.\d+\.\d+).tar.gz$/im)

  if (result) {
    build.shasum = result[1]
    build.packageName = result[2]
  } else {
    throw new Error('bad checksum data', shasumData)
  }
}

function extractBinaryChecksums (build, shasumData) {
  var result = shasumData.match(/^(\w{64}) {2}(?:\.\/)?((?:(?:node|iojs)-v\d+\.\d+\.\d+)-(?!headers|baddocs)(.+).tar.gz)$/gim)
  if (!result) return

  result.forEach(function (distro) {
    var result = distro.match(/^(\w{64}) {2}(?:\.\/)?((?:(?:node|iojs)-v\d+\.\d+\.\d+)-(.+).tar.gz)$/i)
    if (!result) return
    build.binaries.push(
      Object.assign(Object.create(Binary), {
        build: build,
        shasum: result[1],
        package: result[2],
        platform: result[3]
      })
    )
  })
}

function writeFile (err, build) {
  if (err) return console.error(err)

  fs.writeFile(build.filename, build.definition, function (err) {
    if (err) return console.error(err)

    console.log(build.packageName + ' written')
  })
}

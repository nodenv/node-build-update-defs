var format = require('util').format
var Build = require('./build')().Build
var Binary = require('./build')().Binary

module.exports = {
  name: 'jxcore',
  distributionListing: 'https://raw.githubusercontent.com/ktrzeciaknubisa/jxcore-issues/master/index.json',
  distToBuild: function (release) {
    release.jxcore = release.jxcore.replace(/^Beta-/, '')
    var binaries = release.dist
    .map(normalizePlatform)
    .filter(supportedPlatforms)
    .reduce(expandDebianArm, [])

    var v8Build = Object.assign(Object.create(V8Build), {
      version: release.jxcore,
      url: release.source.tar.url,
      shasum: release.source.tar.sha256,
      binaries: binaries,
      npm: release.npmjx.url + '#' + release.npmjx.sha256
    })
    var spiderMonkeyBuild = Object.assign(Object.create(SMBuild), {
      version: release.jxcore,
      url: release.source.tar.url,
      shasum: release.source.tar.sha256,
      binaries: binaries,
      npm: release.npmjx.url + '#' + release.npmjx.sha256
    })

    return [ v8Build, spiderMonkeyBuild ]
  }
}

// private

var JxcoreBuild = Object.create(Build, {
  binaries: {
    get: function () {
      return this._binaries
    },
    set: function (binaries) {
      this._binaries = binaries.filter(engine(this.engine)).map(createBinary)
    }
  },
  install: {
    get: function () {
      return format('install_package %s "%s"\n', this.packageName, this.downloadUri)
    }
  },
  name: {
    get: function () {
      return 'jxcore+' + this.engine
    }
  },
  packageName: {
    get: function () {
      return format('jxcore-%s', this.version)
    }
  },
  preamble: {
    value: 'after_install_package() {\n  fix_jxcore_directory_structure\n}\n\n'
  },
  postamble: {
    get: function () {
      return format('install_package npm "%s" jxcore_npm\n', this.npm)
    }
  }
})

var V8Build = Object.create(JxcoreBuild, {
  engine: { value: 'v8' }
})

var SMBuild = Object.create(JxcoreBuild, {
  engine: { value: 'sm' },
  install: {
    get: function () {
      return format('install_package %s "%s" jxcore_spidermonkey standard\n', this.packageName, this.downloadUri)
    }
  }
})

function normalizePlatform (dist) {
  dist.platform = dist.platform.toLowerCase().replace(/\s/g, '')
  .replace(/osxintel/, 'darwin')
  .replace(/rh\/centos\/fedora/, 'redhat')
  .replace(/ubuntu\/mint/, 'ubuntu')

  dist.arch = (dist.arch || '').toLowerCase()
  .replace(/ia32/, 'x86')

  return dist
}

function supportedPlatforms (dist) {
  return dist.platform !== 'windows' && dist.platform !== 'android' && dist.platform !== 'ios'
}

function expandDebianArm (binaries, binary) {
  if (binary.platform === 'debian' && binary.arch === 'arm') {
    binaries.push(
      Object.assign(Object.create(binary), {arch: 'arm64'}),
      Object.assign(Object.create(binary), {arch: 'armv7l'})
    )
  } else {
    binaries.push(binary)
  }
  return binaries
}

function engine (engine) {
  return function (dist) { return dist.engine === engine }
}

function createBinary (dist) {
  return Object.assign(Object.create(Binary), {
    arch: dist.arch,
    os: dist.platform,
    shasum: dist.sha256,
    url: dist.url
  })
}

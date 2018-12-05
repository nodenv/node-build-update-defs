const fetch = require('./fetch')
const { Build, Binary } = require('./build')
const NullBuild = require('./build-null')

class BuildNode extends Build {
  constructor (name, baseUri, version) {
    super(name, version)
    BinaryNode.prototype.baseUri = this.baseUri = baseUri
  }

  get install () {
    return `install_package "${this.packageName}" "${this.downloadUri}"\n`
  }

  get url () {
    return `${this.baseUri}${this.version}/${this.packageName}.tar.gz`
  }

  complete () {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 7000))
      .then(fetch.bind(null, this.baseUri + this.version + '/SHASUMS256.txt'))
      .then(shasumData => {
        Object.assign(this, sourcePackage(shasumData))
        Object.assign(this, binaryPackages(shasumData))
        return this
      })
      .then(build => {
        if (build.packageName || build.binaries.length) {
          return build
        }

        return new NullBuild(build)
      })
  }
}

class BinaryNode extends Binary {
  get url () {
    return `${this.baseUri}${this.version}/${this.packageName}.tar.gz`
  }
}

module.exports = {
  Build: BuildNode,
  Binary: BinaryNode
}

// private

function sourcePackage (shasumData) {
  const result = shasumData.match(
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
  const matches = []
  const regex = new RegExp(
    /^(\w{64}) {2}(?:\.\/)?((?:node-(v\d+\.\d+\.\d+(?:-rc\.\d+)?))-([^.]+)-([^.]+))\.tar\.gz$/gim
  )

  let result
  while ((result = regex.exec(shasumData))) {
    matches.push(
      new BinaryNode({
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

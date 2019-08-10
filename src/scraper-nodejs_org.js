const fetch = require('./fetch')
const IterableRegExp = require('./iterable-regexp')
const NodeDefinition = require('./definition-node')
const Scraper = require('./scraper')

module.exports = class NodejsOrgScraper extends Scraper {
  constructor ({
    name = 'node',
    displayName,
    baseUri,
    listing = baseUri + 'index.json'
  }) {
    super({ name, displayName, listing })
    this.baseUri = baseUri
  }

  build ({ version }) {
    return wait(Math.random() * 7)
      .then(() => fetch(this.baseUri + version + '/SHASUMS256.txt'))
      .then(
        shasumData =>
          new NodeDefinition({
            baseUri: this.baseUri,
            version,
            ...sourcePackageFrom(shasumData),
            binaries: binaryPackagesFrom(shasumData)
          })
      )
  }
}

function wait (time) {
  return new Promise(resolve => setTimeout(resolve, time * 1000))
}

function sourcePackageFrom (shasumData) {
  const regex = /^(\w{64}) {2}(?:\.\/)?(node-v\d+\.\d+\.\d+(?:(?:-rc\.\d+)|(?:-nightly\d{8}[0-9a-f]{10}))?)\.tar\.gz$/im
  const [, shasum, packageName] = regex.exec(shasumData) || []

  return { packageName, shasum }
}

function binaryPackagesFrom (shasumData) {
  return new IterableRegExp(
    /^(\w{64}) {2}(?:\.\/)?((?:node-(v\d+\.\d+\.\d+(?:(?:-rc\.\d+)|(?:-nightly\d{8}[0-9a-f]{10}))?))-([^.]{1,10})-([^.]+))\.tar\.gz$/gim
  )
    .allMatches(shasumData)
    .map(([, shasum, packageName, version, os, arch]) => ({
      shasum,
      packageName,
      version,
      os,
      arch
    }))
}

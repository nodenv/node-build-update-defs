const NodeDefinition = require('./node-definition')
const DefinitionFile = require('./definition-file')
const fetch = require('./fetch')
const IterableRegExp = require('./iterable-regexp')

class Scraper {
  constructor ({ name, displayName, baseUri, listing }) {
    this.name = name
    this.displayName = displayName
    this.baseUri = baseUri
    this.listing = listing
  }

  scrape () {
    console.log('Checking for new', this.displayName, 'versions')
    return Promise.resolve(this.listing)
      .then(listing => this.fetch(listing))
      .then(file => this.parse(file))
      .catch(e => {
        e.message = 'Error with distribution listing: ' + e.message
        throw e
      })
      .then(releases => this.filter(releases))
      .then(files => files.map(file =>
        DefinitionFile.write(file, this.build(file))
      ))
      .then(Promise.all.bind(Promise))
      .catch(console.error)
  }
}

module.exports = class NodejsOrgScraper extends Scraper {
  constructor (...args) {
    super(...args)

    NodeDefinition.prototype.baseUri = this.baseUri
  }

  fetch (listing) {
    return fetch(listing)
  }

  parse (file) {
    return JSON.parse(file)
  }

  filter (releases) {
    return releases
      .map(release => new DefinitionFile({
        name: this.name,
        version: release.version }))
      .filter(DefinitionFile.toWrite)
  }

  build ({ version }) {
    return wait(Math.random() * 7)
      .then(() => fetch(this.baseUri + version + '/SHASUMS256.txt'))
      .then(shasumData => new NodeDefinition(Object.assign(
        { version },
        sourcePackageFrom(shasumData),
        binaryPackagesFrom(shasumData)
      )))
  }
}

function wait (time) {
  return new Promise(resolve => setTimeout(resolve, time * 1000))
}

function sourcePackageFrom (shasumData) {
  const [, shasum, packageName] = (/^(\w{64}) {2}(?:\.\/)?(node-v\d+\.\d+\.\d+(?:-rc\.\d+)?)\.tar\.gz$/im)
    .exec(shasumData)

  if (!packageName) console.warn('Missing source package')

  return { packageName, shasum }
}

function binaryPackagesFrom (shasumData) {
  const binaries = new IterableRegExp(/^(\w{64}) {2}(?:\.\/)?((?:node-(v\d+\.\d+\.\d+(?:-rc\.\d+)?))-([^.]+)-([^.]+))\.tar\.gz$/gim)
    .allMatches(shasumData)
    .map(([, shasum, packageName, version, os, arch]) =>
      ({ shasum, packageName, version, os, arch }))

  return { binaries }
}

const DefinitionFile = require('./definition-file')
const fetch = require('./fetch')

const constant = x => () => x

module.exports = class Scraper {
  constructor ({ name, displayName = name, listing }) {
    this.name = name
    this.displayName = displayName
    this.listing = listing
  }

  scrape (options) {
    this.options = options
    console.log('Checking for new', this.displayName, 'versions')
    return Promise.resolve(this.listing)
      .then(listing => this.fetch(listing))
      .then(file => this.parse(file))
      .then(releases => this.map(releases))
      .catch(e => {
        e.message = 'with distribution listing: ' + e.message
        throw e
      })
      .then(releases => this.filter(releases))
      .then(files => this.write(files))
      .then(Promise.all.bind(Promise))
      .catch(console.error)
  }

  dryRun (fn) {
    return this.options.dryRun ? constant('skipped') : fn
  }

  fetch (listing) {
    return fetch(listing)
  }

  parse (file) {
    return JSON.parse(file)
  }

  map (releases) {
    return releases.map(
      release =>
        new DefinitionFile({
          name: this.name,
          ...release
        })
    )
  }

  filter (releases) {
    return releases
      .filter(DefinitionFile.matching)
      .filter(DefinitionFile.toWrite)
  }

  write (files) {
    return files.map(file => DefinitionFile.write(file, this.build(file)))
  }
}

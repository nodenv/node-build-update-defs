var Build = require('./build-node')('node', 'https://nodejs.org/dist/').Build

module.exports = {
  name: 'nodejs',
  distributionListing: 'https://nodejs.org/dist/index.json',
  distToBuild: function (release) {
    return Object.create(Build, {
      version: { value: release.version }
    })
  }
}

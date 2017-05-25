var Build = require('./build-node')('node', 'https://nodejs.org/download/rc/').Build

module.exports = {
  name: 'nodejs',
  distributionListing: 'https://nodejs.org/download/rc/index.json',
  distToBuild: function (release) {
    return Object.create(Build, {
      version: { value: release.version }
    })
  }
}

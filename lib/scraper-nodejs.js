const { Build } = require('./build-node')

module.exports = {
  name: 'nodejs',
  distributionListing: 'https://nodejs.org/dist/index.json',
  distToBuild: release =>
    new Build('node', 'https://nodejs.org/dist/', release.version)
}

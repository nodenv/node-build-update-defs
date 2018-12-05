const { Build } = require('./build-node')

module.exports = {
  name: 'nodejs release candidate',
  distributionListing: 'https://nodejs.org/download/rc/index.json',
  distToBuild: release =>
    new Build('node', 'https://nodejs.org/download/rc/', release.version)
}

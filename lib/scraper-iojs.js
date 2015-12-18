var Build = require('./build-node')('iojs', 'https://iojs.org/dist/').Build

module.exports = {
  name: 'iojs',
  distributionListing: 'https://iojs.org/dist/index.json',
  distToBuild: function (release) {
    return Object.create(Build, {
      version: { value: release.version }
    })
  }
}

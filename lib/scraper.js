var fs = require('fs')
var fetch = require('./fetch')

module.exports = function scraper (node, options) {
  console.log('Updating', node.name, 'versions')

  fetch(node.distributionListing)
  .then(JSON.parse)
  .catch(function (e) {
    e.message = 'Error with distribution listing: ' + e.message
    throw e
  })
  .then(function (distributions) {
    return distributions.map(node.distToBuild)
    .reduce(function (builds, build) {
      return builds.concat(build)
    }, [])
    .filter(function (build) {
      return !build.exists(options.definitionPaths) || options.overwrite
    })
    .map(function (build) {
      return build.complete().then(function (build) {
        var writer = options.dryRun ? dryRunWriter : fs.writeFile

        return build.write(options.definitionPaths[0], writer)
      })
    })
  })
  .then(Promise.all.bind(Promise))
  .catch(function (e) { console.error(e) })
}

// private

function dryRunWriter (filename, content, cb) {
  console.log('--- Writing', filename)
  console.log(content)
  cb()
}

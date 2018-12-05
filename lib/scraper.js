const fs = require('fs')
const fetch = require('./fetch')
const path = require('path')

module.exports = function scraper (node, options) {
  console.log('Checking for new', node.name, 'versions')

  fetch(node.distributionListing)
    .then(JSON.parse)
    .catch(e => {
      e.message = 'Error with distribution listing: ' + e.message
      throw e
    })
    .then(distributions =>
      distributions
        .map(node.distToBuild)
        .filter(definitionsToWrite(options))
        .map(build => build.write(writer(options)))
    )
    .then(Promise.all.bind(Promise))
    .catch(console.error.bind(console))
}

// private

function definitionsToWrite (options) {
  return options.overwrite
    ? () => true
    : build => !build.exists(options.definitionPaths)
}

function writer (options) {
  return prependDirectory(
    options.definitionPaths[0],
    options.dryRun ? dryRunWriter : fs.writeFile
  )
}

function prependDirectory (dir, writer) {
  return (basename, ...args) => writer(path.join(dir, basename), ...args)
}

function dryRunWriter (filename, content, cb) {
  console.log('--- Writing', filename)
  console.log(content)
  cb()
}

const { Build } = require('./build')

module.exports = class NullBuild extends Build {
  write () {
    return this.complete().then(build => {
      console.log(build.basename, 'skipped')
      return build
    })
  }
}

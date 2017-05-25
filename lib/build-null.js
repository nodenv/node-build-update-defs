var Build = require('./build')().Build

module.exports = function(build) {
  return Object.create(build || Build, {
    write: {
      value: function(){
        console.log(this.basename, 'skipped')
        return Promise.resolve(this)
      }
    }
  })
}

var https = require('https')

module.exports = function fetch (uri) {
  return new Promise(function (resolve, reject) {
    https
      .get(uri, function (res) {
        if (res.statusCode !== 200) return reject(res)

        var responseData = ''

        res
          .on('error', reject)
          .on('data', function (data) {
            responseData = responseData + data
          })
          .on('end', function () {
            return resolve(responseData)
          })
      })
      .on('error', reject)
  })
}

const https = require('https')

module.exports = uri =>
  new Promise((resolve, reject) =>
    https
      .get(uri, res => {
        if (res.statusCode !== 200) return reject(res)

        let responseData = []

        res
          .on('error', reject)
          .on('data', data => responseData.push(data))
          .on('end', () => resolve(responseData.join('')))
      })
      .on('error', reject)
  )

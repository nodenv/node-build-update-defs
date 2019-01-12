const https = require('https')
const { URL } = require('url')

const urlToOpts = url => ({
  headers: {
    'User-Agent': 'nodenv/node-build-update-defs'
  },
  host: url.hostname,
  path: url.pathname + url.search
})

module.exports = uri =>
  new Promise((resolve, reject) =>
    https
      .get(urlToOpts(new URL(uri)), res => {
        if (res.statusCode !== 200) return reject(res)

        let responseData = []

        res
          .on('error', reject)
          .on('data', data => responseData.push(data))
          .on('end', () => resolve(responseData.join('')))
      })
      .on('error', reject)
  )

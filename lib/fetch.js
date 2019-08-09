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

        const responseData = []

        res
          .on('error', reject)
          .on('data', data => responseData.push(data))
          .on('end', () => resolve(responseData.join('')))
      })
      .on('error', reject)
  )

const crypto = require('crypto')

module.exports.digest = (uri, opts = {}, algorithm = 'sha256') => {
  if (!uri) return Promise.resolve('')

  const urlOpts = urlToOpts(new URL(uri))

  // explicit opts take precedence
  opts = Object.assign({}, urlOpts, opts)

  // but we need to deepMerge headers
  opts.headers = {
    ...urlOpts.headers,
    ...opts.headers
  }

  return new Promise((resolve, reject) =>
    https.get(opts, res => {
      if (res.statusCode % 300 < 100) {
        return resolve(
          module.exports.digest(
            res.headers.location,
            { headers: opts.headers },
            algorithm
          )
        )
      } else if (res.statusCode !== 200) {
        return reject(res)
      }

      const hash = crypto.createHash(algorithm)

      res
        .on('error', reject)
        .on('data', d => hash.update(d))
        .on('end', () => resolve(hash.digest('hex')))
    })
  )
}

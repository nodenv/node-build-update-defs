const { digest } = require('./fetch')
const GraalDefinition = require('./definition-graal')
const Scraper = require('./scraper')

const identity = x => x

const throttleErrors = err => {
  throw new Error(
    err.statusCode === 403
      ? `being throttled; wait till ${new Date(
        err.headers['x-ratelimit-reset'] * 1000
      ).toLocaleTimeString()}`
      : err
  )
}

const computeChecksum = dryRun => pkg =>
  dryRun
    ? 'skipped'
    : digest(pkg.apiUrl, {
      headers: {
        Accept:
            (pkg.content_type ? `${pkg.content_type};q=1.0, ` : '') +
            'application/octet-stream;q=0.9'
      }
    }).catch(throttleErrors)

module.exports = class GithubScraper extends Scraper {
  constructor ({ name, displayName, org, repo, matchReleases = identity }) {
    super({
      name,
      displayName,
      listing: `https://api.github.com/repos/${org}/${repo}/releases`
    })
    this.matchReleases = matchReleases
  }

  fetch (listing) {
    return super.fetch(listing).catch(throttleErrors)
  }

  map (releases) {
    return super.map(
      releases.filter(this.matchReleases).map(release => ({
        version: release.tag_name.replace(/^vm-/, ''),
        url: release.tarball_url,
        binaries: release.assets.map(
          ({ name, browser_download_url: url, url: apiUrl }) => ({
            apiUrl,
            name,
            url
          })
        )
      }))
    )
  }

  build (release) {
    return Promise.all(
      release.binaries.map(computeChecksum(this.options.dryRun))
    )
      .then(checksums =>
        release.binaries.forEach((bin, i) => (bin.sha = checksums[i]))
      )
      .then(
        binaries =>
          new GraalDefinition({
            name: this.name,
            ...release
          })
      )
  }
}

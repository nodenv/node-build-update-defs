const { digest } = require("./fetch")
const GraalDefinition = require("./definition-graal")
const Scraper = require("./scraper")

const identity = (x) => x

const throttleErrors = (err) => {
  throw new Error(
    err.statusCode === 403
      ? `being throttled; wait till ${new Date(
          err.headers["x-ratelimit-reset"] * 1000
        ).toLocaleTimeString()}`
      : `${err.statusCode}: ${err.statusMessage}`
  )
}

const computeAssetChecksum = (pkg) =>
  digest(pkg.apiUrl, {
    headers: {
      Accept: `${pkg.content_type};q=1.0, application/octet-stream;q=0.8`
    }
  }).catch(throttleErrors)

const computeTarballChecksum = (pkg) =>
  digest(pkg.url, {
    headers: { Accept: "application/vnd.github.v3.raw;q=0.5" }
  }).catch(throttleErrors)

module.exports = class GithubScraper extends Scraper {
  constructor({ name, displayName, org, repo, filterReleases = identity }) {
    super({
      name,
      displayName,
      listing: `https://api.github.com/repos/${org}/${repo}/releases`
    })
    this.filterReleases = filterReleases
  }

  fetch(listing) {
    return super.fetch(listing).catch(throttleErrors)
  }

  map(releases) {
    return super.map(
      this.filterReleases(releases).map((release) => ({
        version: release.tag_name,
        url: release.tarball_url,
        binaries: release.assets.map(
          ({ browser_download_url: url, url: apiUrl }) => ({
            apiUrl,
            url
          })
        )
      }))
    )
  }

  build(release) {
    return Promise.all([
      ...release.binaries.map(this.dryRun(computeAssetChecksum)),
      this.dryRun(computeTarballChecksum)(release)
    ]).then(
      (checksums) =>
        new GraalDefinition({
          ...release,
          name: this.name,
          shasum: checksums.pop(),
          binaries: release.binaries.map((bin, i) => ({
            ...bin,
            sha: checksums[i]
          }))
        })
    )
  }
}

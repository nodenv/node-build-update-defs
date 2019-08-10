const DefinitionFile = require('./src/definition-file')
const GithubScraper = require('./src/scraper-github')
const NodejsOrgScraper = require('./src/scraper-nodejs_org')

const scrapers = {
  nodejs: new NodejsOrgScraper({
    displayName: 'nodejs',
    baseUri: 'https://nodejs.org/dist/'
  }),

  'nodejs-pre': new NodejsOrgScraper({
    displayName: 'nodejs release candidate',
    baseUri: 'https://nodejs.org/download/rc/'
  }),

  'nodejs-nightly': new NodejsOrgScraper({
    displayName: 'nodejs nightly',
    baseUri: 'https://nodejs.org/download/nightly/'
  }),

  chakracore: new NodejsOrgScraper({
    name: 'chakracore',
    baseUri: 'https://nodejs.org/download/chakracore-release/'
  }),

  'chakracore-pre': new NodejsOrgScraper({
    name: 'chakracore',
    displayName: 'chakracore release candidate',
    baseUri: 'https://nodejs.org/download/chakracore-rc/'
  }),

  'chakracore-nightly': new NodejsOrgScraper({
    name: 'chakracore',
    displayName: 'chakracore nightly',
    baseUri: 'https://nodejs.org/download/chakracore-nightly/'
  }),

  graal: new GithubScraper({
    name: 'graal+ce',
    org: 'oracle',
    repo: 'graal',
    filterReleases: releases =>
      releases
        .filter(r => /^vm-/.test(r.tag_name))
        .map(r => ({
          tag_name: r.tag_name.replace(/^vm-/, ''),
          assets: r.assets
        }))
  })
}

module.exports = function scrape (options) {
  DefinitionFile.configure(options)

  options.run.forEach(scraper => scrapers[scraper].scrape(options))
}

# node-build-update-defs

[nodenv][] plugin to generate [node-build][]-compatible definitions from [nodejs.org](https://nodejs.org)

[![Tests](https://img.shields.io/github/actions/workflow/status/nodenv/node-build-update-defs/test.yml?label=tests&logo=github)](https://github.com/nodenv/node-build-update-defs/actions/workflows/test.yml)
[![Latest GitHub Release](https://img.shields.io/github/v/release/nodenv/node-build-update-defs?label=github&logo=github&sort=semver)](https://github.com/nodenv/node-build-update-defs/releases/latest)
[![Latest Homebrew Release](<https://img.shields.io/badge/dynamic/regex?label=homebrew-nodenv&logo=homebrew&logoColor=white&url=https%3A%2F%2Fraw.githubusercontent.com%2Fnodenv%2Fhomebrew-nodenv%2Frefs%2Fheads%2Fmain%2FFormula%2Fnode-build-update-defs.rb&search=archive%2Frefs%2Ftags%2Fv(%3F%3Cversion%3E%5Cd%2B.*).tar.gz&replace=v%24%3Cversion%3E>)](https://github.com/nodenv/homebrew-nodenv/blob/main/Formula/node-build-update-defs.rb)
[![Latest npm Release](https://img.shields.io/npm/v/@nodenv/node-build-update-defs?logo=npm&logoColor=white)](https://www.npmjs.com/package/@nodenv/node-build-update-defs/v/latest)

<!-- toc -->

- [Installation](#installation)
  - [Installing with Git](#installing-with-git)
  - [Installing with Homebrew](#installing-with-homebrew)
  - [Installation with npm](#installation-with-npm)
- [Requirements](#requirements)
- [Usage](#usage)
  - [Special environment variables](#special-environment-variables)
- [Cleanup/Pruning](#cleanuppruning)

<!-- tocstop -->

## Installation

Recommended installation is via Git clone into your nodenv root, as per below.
However, this plugin may also be installed via Homebrew or npm.
If installed outside of `NODENV_ROOT`, you must ensure its `share/node-build` directory has been added to the `NODE_BUILD_DEFINITIONS` path.

### Installing with Git

To install, clone this repository into your `$(nodenv root)/plugins` directory.

    git clone https://github.com/nodenv/node-build-update-defs.git "$(nodenv root)"/plugins/node-build-update-defs

### Installing with Homebrew

    brew install nodenv/nodenv/node-build-update-defs

> [!note]
> Requires manually adding `$(brew --prefix node-build-update-defs)/share/node-build` directory to `NODE_BUILD_DEFINITIONS`

### Installation with npm

    npm install --global @nodenv/node-build-update-defs

> [!note]
> Requires manually adding `$(npm -g prefix)/lib/node_modules/@nodenv/node-build-update-defs/share/node-build` directory to `NODE_BUILD_DEFINITIONS`

## Requirements

node >= 6.0

Unlike virtually every other nodenv plugin, node-build-update-defs actually depends on node.
(The scraper itself is written in JavaScript.)
Virtually any modern version of node is sufficient, but one must be available.
Otherwise, you may experience an error like:

> nodenv: version \_ is not installed

It is recommended to configure a node-version for the plugin itself (substitute your chosen version):

    echo 6.0 > "$(nodenv root)"/plugins/node-build-update-defs/.node-version

If you have node installed and available in `PATH` _outside_ of nodenv
(by system package manager or Homebrew, for instance)
then the best configuration is to use that for the plugin:

    echo system > "$(nodenv root)"/plugins/node-build-update-defs/.node-version

## Usage

    nodenv update-version-defs

By default, this will create build definitions in the plugin's `share/node-build/` directory.
This directory can be overridden with `--destination`.
For scraped definitions to be picked up by `node-build`/`nodenv install`,
the destination directory must be present in `NODE_BUILD_DEFINTIONS`.
See [special environment variables](#special-environment-variables)

Only definitions that aren't already in node-build's lookup path (`NODE_BUILD_DEFINITIONS`) will be created.
That is, under typical usage only definitions not already shipped with node-build will be created.
To override this and write definitions for _all_ available node/io versions, use `--force`.
(This will overwrite any conflicting definition files that already exist in the destination directory.)

### Special environment variables

- `NODE_BUILD_DEFINITIONS` can be a list of colon-separated paths that get additionally searched when looking up build definitions.
  The `share/node-build/` directories of any plugin under `$(nodenv root)/plugins` are appended to this path by `nodenv install` automatically.
  Definitions already found in these paths will be skipped (unless `--force`).

## Cleanup/Pruning

In normal operation, build definitions will gradually build up in this plugin's `share/node-build` directory (or elsewhere if overridden with `--destination`).
Eventually, as the scraped definitions are added to node-build itself, these user-scraped definitions will become duplicates when their node-build installation is updated.
In order to ensure one is frequently running on the "proper" build definitions from node-build, any duplicates in the plugin directory ought to be removed.

    nodenv prune-version-defs

This subcommand removes (or lists with `--dry-run`) any duplicate build definitions.
Like `update-version-defs`, `--destination <dir>` overrides the default value of `<plugin-root>/share/node-build` as the directory from which duplicates are removed.
Duplicates are searched for under `NODE_BUILD_DEFINITIONS` and are determined by both filename _and_ contents.
The file contents check can be overridden with `--force`, which will delete duplicates based solely on filename.

This subcommand is silent by default, only printing removed duplicates if `--verbose`.
(`--dry-run` implies `--verbose`)

[nodenv]: https://github.com/nodenv/nodenv
[node-build]: https://github.com/nodenv/node-build

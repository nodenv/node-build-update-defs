# node-build-update-defs

A [nodenv][] plugin that provides a `nodenv update-version-defs` command to
create [node-build][]-compatible definitions from nodejs.org.org.

## Installation

Recommended installation is via git clone into your nodenv root, as per below.
However, this plugin may also be installed via homebrew or npm.
If installed outside of `NODENV_ROOT`, you must ensure its `share/node-build` directory has been added to the `NODE_BUILD_DEFINITIONS` path.

### Installing with Git

To install, clone this repository into your `$(nodenv root)/plugins` directory.

    $ git clone https://github.com/nodenv/node-build-update-defs.git "$(nodenv root)"/plugins/node-build-update-defs

### Installing with Homebrew

    $ brew install nodenv/nodenv/node-build-update-defs

*__Note:__
Requires manually adding `$(brew --prefix node-build-update-defs)/share/node-build` directory to `NODE_BUILD_DEFINITIONS`*

### Installation with npm

    $ npm install --global @nodenv/node-build-update-defs

*__Note:__
Requires manually adding `$(npm -g prefix)/lib/node_modules/@nodenv/node-build-update-defs/share/node-build` directory to `NODE_BUILD_DEFINITIONS`*

## Requirements

node >= 6.0

Unlike virtually every other nodenv plugin, node-build-update-defs actually depends on node.
(The scraper runs on node.)
A somewhat recent version of node is required – it is recommended to configure a node-version within the plugin directory itself (substitute your chosen version):

    $ cd "$(nodenv root)"/plugins/node-build-update-defs
    $ nodenv local 6.0

## Usage

    $ nodenv update-version-defs

By default, this will create build definitions in the plugin's `share/node-build/` directory.
This directory can be overridden with `--destination`.
For scraped definitions to be picked up by `node-build`/`nodenv install`,
the destination directory must be present in `NODE_BUILD_DEFINTIONS`.
See [special environment variables](#special-environment-variables)

Only definitions that aren't already in node-build's lookup path (`NODE_BUILD_DEFINITIONS`) will be created.
That is, under typical usage only definitions not already shipped with node-build will be created.
To override this and write definitions for *all* available node/io versions, use `--force`.
(This will overwrite any conflicting definition files that already exist in the destination directory.)

### Special environment variables

- `NODE_BUILD_DEFINITIONS` can be a list of colon-separated paths that get additionally searched when looking up build definitions.
The `share/node-build/` directories of any plugin under `$(nodenv root)/plugins` are appended to this path by `nodenv install` automatically.
Definitions already found in these paths will be skipped (unless `--force`).

## Cleanup/Pruning

In normal operation, build definitions will gradually build up in this plugin's `share/node-build` directory (or elsewhere if overridden with `--destination`).
Eventually, as the scraped definitions are added to node-build itself, these user-scraped definitions will become duplicates when their node-build installation is updated.
In order to ensure one is frequently running on the "proper" build definitions from node-build, any duplicates in the plugin directory ought to be removed.

    $ nodenv prune-version-defs

This subcommand removes (or lists with `--dry-run`) any duplicate build definitions.
Like `update-version-defs`, `--destination <dir>` overrides the default value of `<plugin-root>/share/node-build` as the directory from which duplicates are removed.
Duplicates are searched for under `NODE_BUILD_DEFINITIONS` and are determined by both filename *and* contents.
The file contents check can be overridden with `--force`,  which will delete duplicates based solely on filename.

This subcommand is silent by default, only printing removed duplicates if `--verbose`.
(`--dry-run` implies `--verbose`)

[nodenv]: https://github.com/nodenv/nodenv
[node-build]: https://github.com/nodenv/node-build

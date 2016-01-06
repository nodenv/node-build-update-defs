# node-build-update-defs

A [nodenv][] plugin that provides a `nodenv update-version-defs` command to
create [node-build][]-compatible definitions from nodejs.org and iojs.org. 

## Installation

To install, clone this repository into your `$(nodenv root)/plugins` directory.

    $ git clone https://github.com/jasonkarns/node-build-update-defs.git "$(nodenv root)"/plugins/node-build-update-defs

## Requirements

node >= 4.0 or iojs >= 1.0

Unlike virtually every other nodenv plugin, node-build-update-defs actually depends on node. (The scraper runs on node.) A somewhat recent version of node is required – it is recommended to configure a node-version within the plugin directory itself (substitute your chosen version):

    $ cd "$(nodenv root)"/plugins/node-build-update-defs
    $ nodenv local 4.0

## Usage

    $ nodenv update-version-defs

By default, this will create build definitions in the plugin's `share/node-build/` directory. This directory can be overridden with `--destination`.

Only definitions that aren't already in node-build's lookup path (`NODE_BUILD_DEFINITIONS`) will be created. That is, under typical usage only definitions not already shipped with node-build will be created. To override this and write definitions for *all* available node/io versions, use `--force`. (This will overwrite any conflicting definition files that already exist in the destination directory.)

### Special environment variables

- `NODE_BUILD_DEFINITIONS` can be a list of colon-separated paths that get additionally searched when looking up build definitions. All nodenv plugins' `share/node-build/` directories are appended to this path. Definitions already found in these paths will be skipped (unless `--force`).

## Cleanup/Pruning

In normal operation, build definitions will gradually build up in this plugin's `share/node-build` directory (or elsewhere if overridden with `--destination`). Eventually, as the scraped definitions are added to node-build itself, these user-scraped definitions will become duplicates when their node-build installation is updated. In order to ensure one is frequently running on the "proper" build definitions from node-build, any duplicates in the plugin directory ought to be removed.

    $ nodenv prune-version-defs

This subcommand removes (or lists with `--dry-run`) any duplicate build definitions. Like `update-version-defs`, `--destination <dir>` overrides the default value of `<plugin-root>/share/node-build` as the directory from which duplicates are removed. Duplicates are searched for under `NODE_BUILD_DEFINITIONS` and are determined by both filename *and* contents. The file contents check can be overridden with `--force`,  which will delete duplicates based solely on filename.

This subcommand is silent by default, only printing removed duplicates if `--verbose`. (`--dry-run` implies `--verbose`)

[nodenv]: https://github.com/OiNutter/nodenv
[node-build]: https://github.com/OiNutter/node-build

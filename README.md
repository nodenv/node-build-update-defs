# node-build-update-defs

A [nodenv][] plugin that provides a `nodenv update-version-defs` command to
create [node-build][]-compatible definitions from nodejs.org and iojs.org. 

## Installation

To install, clone this repository into your `$(nodenv root)/plugins` directory.

    $ git clone https://github.com/jasonkarns/node-build-update-defs.git "$(nodenv root)"/plugins/node-build-update-defs

## Requirements

Unlike virtually every other nodenv plugin, node-build-update-defs actually depends on node. (The scraper runs on node.) A somewhat recent version of node is required: iojs >= 1.0 or node >= 4.0. It is recommended to configure a node-version within the plugin directory itself (substitute your chosen version):

    $ cd "$(nodenv root)"/plugins/node-build-update-defs
    $ nodenv local 4.0

## Usage

    $ nodenv update-version-defs

By default, this will create build definitions in the plugin's `share/node-build/` directory. This directory can be overridden with `--destination`.

Only definitions that aren't already in node-build's lookup path (`NODE_BUILD_DEFINITIONS`) will be created. That is, under typical usage only definitions not already shipped with node-build will be created. To override this and write definitions for *all* available node/io versions, use `--force`. (This will overwrite any conflicting definition files that already exist in the destination directory.)

### Special environment variables

- `NODE_BUILD_DEFINITIONS` can be a list of colon-separated paths that get additionally searched when looking up build definitions. All nodenv plugins' `share/node-build/` directories are appended to this path. Definitions already found in these paths will be skipped (unless `--force`).

[nodenv]: https://github.com/OiNutter/nodenv
[node-build]: https://github.com/OiNutter/node-build

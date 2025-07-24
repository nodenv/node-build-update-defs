const fs = require("fs")
const path = require("path")

module.exports = class DefinitionFile {
  static configure({ dryRun, overwrite, pattern, definitionPaths }) {
    this.destDir = definitionPaths[0]
    this.writer = dryRun ? this.dryRunWriter : this.fsWriter
    this.matching = pattern
      ? (definitionFile) => definitionFile.matches(pattern)
      : () => true
    this.toWrite = overwrite
      ? () => true
      : (definitionFile) => !definitionFile.existsIn(definitionPaths)
  }

  static write(file, definition) {
    return file.write(this.writer, definition)
  }

  static dryRunWriter(filename, content) {
    return new Promise((resolve) => {
      console.log("------- Writing", filename)
      console.log(content)
      console.log("-------------------")
      resolve()
    })
  }

  static fsWriter(...args) {
    return new Promise((resolve, reject) =>
      fs.writeFile(...args, (err) => (err ? reject(err) : resolve()))
    )
  }

  constructor(props) {
    // at least: name, version
    Object.assign(this, props)
  }

  get basename() {
    return `${this.name}-${this.version.replace(/^v/, "")}`.replace(/node-/, "")
  }

  filename(dir = this.constructor.destDir) {
    return path.join(dir, this.basename)
  }

  existsIn(dirs) {
    return dirs.some((dir) => fs.existsSync(this.filename(dir)))
  }

  matches(pattern) {
    return this.basename.match(pattern)
  }

  write(write, definition) {
    return Promise.resolve(definition)
      .then((contents) => write(this.filename(), contents.toString()))
      .then(() => console.log(this.basename, "written"))
      .catch((e) => console.error(`${this.basename} skipped (${e})`))
  }
}

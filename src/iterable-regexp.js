module.exports = class IterableRegExp {
  constructor(regex) {
    this.regex = regex
  }

  allMatches(data) {
    this.regex.lastIndex = 0
    this.data = data
    return Array.from(this)
  }

  next() {
    const value = this.regex.exec(this.data)
    return { value, done: !value }
  }

  [Symbol.iterator]() {
    return this
  }
}

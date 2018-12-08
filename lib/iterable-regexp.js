module.exports = class IterableRegExp {
  constructor (regex) {
    this.regex = regex
  }

  allMatches (data) {
    this.regex.lastIndex = 0
    this.data = data
    return Array.from(this)
  }

  next () {
    const result = this.regex.exec(this.data)
    return result ? { value: result, done: false } : { done: true }
  }

  [Symbol.iterator] () {
    return this
  }
}

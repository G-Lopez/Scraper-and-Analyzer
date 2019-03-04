module.exports = (text) => {
  let RegExpResult
  try {
    RegExpResult = text.match(/(\d) of 5 bubbles/i)[1]
  } catch (e) {
    RegExpResult = 0
    console.log('had trouble getting the general rating for this hotel')
  }
  return Number(RegExpResult)
}

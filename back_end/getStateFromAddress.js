module.exports = address => {
  state = ''
  try {
    state = address.match(/, ([A-Z]{2})\s/)[1]
  } catch (err) {
    state = null
  }
  return state
}

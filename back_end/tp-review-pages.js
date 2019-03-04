module.exports = function (url, max_page, callback) {
  let result   = []

  for (var i = 0; i < max_page; i++) {
    if (i >= 4) {
      break
    }
    var top    = url.split('-').slice(0,4)
    var bottom = url.split('-').slice(4)
    var final  = top.concat('or' + i * 10).concat(bottom)
    final      = final.join('-')
    result.push(final)
  }

  callback(result)
}

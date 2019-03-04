// :: get "#11 of 468 Hotels in New York City "
module.exports = (text) => {
  let ranking = {}

  // :: clean the text
  text = text.trim()

  // :: run regex and get results
  let RegExpResult = text.match(/(\d+) of (\d+)/)

  ranking.num = RegExpResult[1]
  ranking.total = RegExpResult[2]
  ranking.text = text

  return ranking
}

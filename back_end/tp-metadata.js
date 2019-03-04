const rp = require('request-promise')
const cheerio = require('cheerio')

// :: parsing
const parseGeneralRating = require('./modules/parseRating')
const parseRanking       = require('./modules/parseRanking')
const parseAddress       = require('./modules/parseAddress')

let getMetaData = function (iurl, callback) {
  let maxTryCount = 2
  let tryCount = 0
  rp({uri : iurl, transform: body => cheerio.load(body) })
      .then(($) =>  {
        let url = iurl
        //--- Name --//
        let name = $('h1#HEADING').text().trim().split('\n').join('')
        //--- ID --//
        let id = Number(url.split('-')[2].substring(1))
        //--- Address --//
        let address
        try {
          address = parseAddress($('.blEntry').text())
        } catch (e) { console.log('* no address') }
        //--- Room Nums --//
        let room_num = Number($('span.tabs_num_rooms').text().trim())
        //--- Forbes Rating --//
        let forbes_rating
        try {
          forbes_rating = $('.ui_star_rating').attr('class').replace(/\D/gm, '').length === 2 ? Number($('.ui_star_rating').attr('class').replace(/\D/gm, '')) / 10 : 0
        } catch (e) {
          forbes_rating = 0
          console.log('* no phone')
        }


        //--- Phone Number  --//
        let phone_number
        try {
          phone_number = eval($('.phone').text().trim().replace(/<!--/gm, '').replace(/\/\/-->/gm, '').replace('document.write', 'return'))
        } catch (e) {
          console.log('* no phone')
          phone_number = 'not stated'
        }

        //--- General Rating --//
        let rating
        try {
          rating = parseGeneralRating($('.ui_bubble_rating').attr('alt'))
        } catch (e) {
          console.log('* no rating')
          rating = 0
        }
        //--- location Ranking --//
        let ranking
        try {
          ranking = parseRanking($('.header_popularity').text())
        } catch (e) {
          console.log('* no ranking')
        }

        //--- Tags --//
        let tags = []
        try { $('span.tag').each(function (i, el) {tags.push($(this).text().trim().split('\n').join(''))}) } catch (e) {}
        tags.shift()
        //--- Keywords --//
        let keywords = []
        try {
          $('.ui_tagcloud').each((i, el) => { keywords.push( $(this).text().replace(/\n/gm, '') ) })
          keywords = keywords.slice(1, keywords.length)
        } catch (e) { console.log('* problem with keywords') }
        //--- Hotel max Page --//
        let max_page = Number($('.pageNumbers').children('.pageNum').last().text())
        //--- Certifificate --//
        let certificate
        try {
          if ($('.coeBadgeDiv').text().toUpperCase().search('CERTIFICATE') >= 0) { certificate = true } else { certificate = false }
        } catch (e) { console.log('* no certificate')}

        //--- Review Counts --//
        let excellent, very_good, average, poor, terrible

        for (var i = 0; i <= 4; i++) {
          let temp = Number($('#ratingFilter')
            .children('ul')
            .children('li')
            .eq(i)
            .children('label')
            .children('span')
            .text()
            .replace(',',"")
            .trim()
          )

          isNaN(temp) ? temp = 0 : null
          i === 0 ? excellent = temp : null
          i === 1 ? very_good = temp : null
          i === 2 ? average   = temp : null
          i === 3 ? poor      = temp : null
          i === 4 ? terrible  = temp : null
        }

        //--- Total Reviews --//
        let total_reviews = excellent + very_good + average + poor + terrible

        let hotel = {
          name,
          certificate,
          id,
          url,
          address,
          phone_number,
          forbes_rating,
          rating,
          ranking,
          room_num,
          keywords,
          tags,
          terrible,
          poor,
          average,
          very_good,
          excellent,
          total_reviews,
          max_page
        }
        callback(hotel)
      }).catch(function (err) {
        console.log(err)
        tryCount++
        if (tryCount >= maxTryCount) {
          console.log('went through ' + maxTryCount + ' tries, no nope for this hotel bubby')
          return callback(hotel)
        }
        getMetaData(iurl, callback)
      })
}

module.exports = getMetaData

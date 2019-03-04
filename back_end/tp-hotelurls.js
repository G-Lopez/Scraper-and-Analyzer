const rp = require('request-promise')
const cheerio = require('cheerio')

let hotelurlsfromcity = function (url, callback) {
  rp({uri : url, transform: function (body) {return cheerio.load(body)}})
    .then(function ($) {
      let tripadvisorResource = url.replace('https://www.tripadvisor.com', '')
      var max = Number($('.pageNumbers').children('.pageNum').last().text())
      //-- this is the max pages in an area. used for loop to get all hotel urls
      let citypages = []
      //Breaks apart the url and insert or + multiples of 30 to iterate through the url to load all pages of sets of hotels
      for (let i = 0; i < max; i++) {
        let top = tripadvisorResource.split('-').slice(0,2)
        let mid = 'oa' + (i * 30)
        let bottom = tripadvisorResource.split('-').slice(2)
        let total = top.concat(mid).concat(bottom).join('-')
        citypages.push(total)
        // these are each page of the city
      }

      //console.log(citypages)

      let city_page_count = 0
      //each page from the area is thrown into citypages
      let hotelUrls = []

      let loadedCount = 0
      for (page of citypages) {
        rp({uri : 'http://tripadvisor.com' + page, transform: function (body) {return cheerio.load(body)}})
        .then($ => {
          $('.listing_title').children('a.property_title').each(function(i, el) {
            hotelUrls.push('https://www.tripadvisor.com' + $(this).attr('href'))
          })
          loadedCount++
          if (loadedCount === citypages.length) {
            callback(hotelUrls)
            return
          }
        }).catch(err => {
          console.log(err)
          callback(hotelUrls)
          return
        })
      }

      // if problems use controlled below
      /*function getCityPageAndPushUrls (num) {
        if (num === citypages.length) {
          callback(hotelUrls)
          return
        }
        rp({uri : 'http://tripadvisor.com' + citypages[num], transform: function (body) {return cheerio.load(body)}})
          .then($ => {
            $('.listing_title').children('a.property_title').each(function(i, el) {
              hotelUrls.push('https://www.tripadvisor.com' + $(this).attr('href'))
            })
            getCityPageAndPushUrls(num + 1)
          }).catch(err => {
            console.log(err)
            callback(hotelUrls)
          })
      }*/
      //getCityPageAndPushUrls(0)
    })
}

module.exports = hotelurlsfromcity

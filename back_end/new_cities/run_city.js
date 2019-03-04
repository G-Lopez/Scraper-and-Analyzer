const getHotelMetaData = require('../tp-metadata.js')
const getReviewPages = require('../tp-review-pages.js')
const getReviews = require('../tp-review-partial.js')
const getHotelUrlsFromCity = require('../tp-hotelurls.js')
const uploadToMongo = require('../tp-mongo-upload.js')
const sleep = require('system-sleep')
const jsonfile = require('jsonfile')

let env_city = process.env.CITY_NAME

setTimeout(function () {
  process.exit()
}, 3 * 60 * 60 * 1000)

jsonfile.readFile('../tp-config.json', function (err, config) {
  city = config.cities[env_city]
  console.log('running:', city.name)
  // first get config
  getHotelUrlsFromCity(city.url, function (urls) {
    function getHotel(num) {
      if (num == urls.length) {
        return
        console.log('done')
        process.exit()
      }
      let maxTime = (config.hotel_timeout_time * 1000) // 25 seconds
      let hotelTimeOut = setTimeout(function () {
        console.log('shit, couldn\'t get this one')
        console.log('waiting a little bit now')
        console.log('-----> NEXT <-----')
        console.log('-- ' + (num + 1) + ' out of ' + urls.length + ' --');
        console.log('------------------')
        sleep(config.hotel_timeout_sleep_time * 1000)
        getHotel(num + 1)
      }, maxTime)
      getHotelMetaData(urls[num], function (hotel) {
        getReviewPages(urls[num], hotel.max_page, function (review_pages) {
          getReviews(review_pages, function (reviews) {
            hotel.reviews = reviews
            clearTimeout(hotelTimeOut)
            uploadToMongo(hotel, city.name, function (err) {
              if (err) {
                console.log(err)
              }
              console.log('-----> NEXT <-----')
              console.log('-- ' + (num + 1) + ' out of ' + urls.length + ' --');
              console.log('------------------')
              sleep(config.hotel_sleep_time * 1000)
              getHotel(num + 1)
            })
          })
        })
      })
    }
    getHotel(0)
  })

})

const getHotelMetaData = require('../tp-metadata.js')
const getReviewPages = require('../tp-review-pages.js')
const getReviews = require('../tp-review-partial.js')
const getHotelUrlsFromCity = require('../tp-hotelurls.js')
const uploadToMongo = require('../tp-mongo-upload.js')
const sleep = require('system-sleep')
const config = require('../tp-config')
let env_city = process.env.CITY_NAME
console.log(env_city)
setTimeout(() => {
  process.exit()
}, 60 * 60 * 1000)

// TODO: GET THE URLS FROM THE CITY
// TODO: GET THE META DATA FROM hotel
// TODO: SEND TO MONGO

const city = config.cities[env_city]
console.log(`running ${city.name}`)

getHotelUrlsFromCity(city.url, urls => {
  function getHotel (num) {
    if (num === urls.length) {
      console.log('--> done <--')
      process.exit()
      return
    }
    let maxTime = (4 * 1000) // 4 seconds
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
      //console.log(hotel.name)
      hotel.reviews = []
      uploadToMongo(hotel, city.name, err => {
        if (err) {
          console.log(err)
        }
        console.log('waiting a little bit now')
        console.log('-----> NEXT <-----')
        console.log('-- ' + (num + 1) + ' out of ' + urls.length + ' --');
        console.log('------------------')
        clearTimeout(hotelTimeOut)
        sleep(1000)
        getHotel(num + 1)
      })
    })
  }
  getHotel(0)
})

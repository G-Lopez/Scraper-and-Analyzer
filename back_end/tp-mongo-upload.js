const mongoose            = require('mongoose')
const moment              = require('moment')
const sleep               = require('system-sleep')
const getStateFromAddress = require('./getStateFromAddress')

mongoose.connect('mongodb://jshom:jshom@ds031186-a0.mlab.com:31186,ds031186-a1.mlab.com:31186/trip-alice?replicaSet=rs-ds031186',{
    server: { socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS: 30000 }
    },
    replset: {
      socketOptions: {
        keepAlive: 300000,
        connectTimeoutMS : 30000
      }
    }
  })
let db = mongoose.connection

var Hotel = mongoose.model(
  'Hotel',
  {
    name           : String,
    state          : String,
    city           : String,
    phone_number   : String,
    url            : String,
    id             : Number,
    address        : String,
    room_num       : Number,
    certificate    : Boolean,
    tags           : [String],
    keywords       : [String],
    forbes_rating  : Number,
    time_parsed    : Number,
    ranking        : String,
    general_rating : Number
  }
)

var Review = mongoose.model(
  'Review',
  {
    id                : Number,
    review_id         : Number,
    city              : String,
    name              : String,
    rating            : Number,
    written_time      : String,
    unixTime          : Number,
    written_by_mobile : Boolean,
    user : {
      name            : String,
    //id              : Number,
      location        : String,
      level           : String,
      total_reviews   : Number,
      hotel_reviews   : Number,
      helpful_reviews : Number
    },
    header            : String,
    text              : String,
    time_parsed       : Number,
    response : {
      text            : String,
      time            : String
    },
    ranking           : String,
    general_rating    : Number,
    forbes_rating     : Number
  }
)

var Snapshot = mongoose.model(
  'Snapshot',
  {
    id              : Number,
    name            : String,
    city            : String,
    ranking         : {
      text          : String,
      num           : Number,
      total         : Number
    },
    ratings         : {
      general       : Number,
      total_reviews : Number,
      excellent     : Number,
      very_good     : Number,
      average       : Number,
      poor          : Number,
      terrible      : Number
    },
    time_parsed     : Number,
    forbes_rating   : Number
  }
)

function toMongo (hotel, city, callback) {
  console.log('------- uploading -------')
  let time_now = moment().unix()
  let db_run_timeout
  db_run_timeout = setTimeout(function () {
    // in case uploading fails, wait 5 seconds and try again
    callback('error uploading ', hotel.name)
    return
  }, 30 * 1000)

  var thisHotel = {
    name          : hotel.name,
    city          : city,
    state         : getStateFromAddress(hotel.address),
    phone_number  : hotel.phone_number,
    url           : hotel.url,
    id            : hotel.id,
    address       : hotel.address,
    room_num      : hotel.room_num,
    certificate   : hotel.certificate,
    tags          : hotel.tags,
    keywords      : hotel.keywords,
    forbes_rating : hotel.forbes_rating,
    time_parsed   : time_now,
    ranking       : hotel.ranking.text,
    general_rating: hotel.rating
  }

  let thisSnap = new Snapshot({
    id              : hotel.id,
    city            : city,
    state           : getStateFromAddress(hotel.address),
    name            : hotel.name,
    ranking         : hotel.ranking,
    ratings         : {
      general       : hotel.rating,
      total_reviews : hotel.total_reviews,
      excellent     : hotel.excellent,
      very_good     : hotel.very_good,
      average       : hotel.average,
      poor          : hotel.poor,
      terrible      : hotel.terrible
    },
    time_parsed     : time_now,
    forbes_rating   : hotel.forbes_rating
  })

  thisSnap.save(function (err) {
    if (err) {
      console.log(err)
      callback('error uploading snaphot')
      clearTimeout(db_run_timeout)
      return
    }
    console.log('saved snaphot for: ' + hotel.name)
    Hotel.findOneAndUpdate({id : hotel.id}, thisHotel, {upsert : true}, function (err, doc) {
      if (err) {
        console.log(err)
        clearTimeout(db_run_timeout)
        callback('error uploading hotel')
        return
      }
      console.log('saved hotel for: ' + hotel.name)
      //upload review
      function uploadReview(num) {
        if (num == hotel.reviews.length) {
          console.log('saved reviews for: ' + hotel.name)
          clearTimeout(db_run_timeout)
          callback(null)
          return
        }
        let current_review = {
          id                : hotel.id,
          name              : hotel.name,
          city              : city,
          rating            : hotel.reviews[num].rating || 0,
          general_rating    : hotel.rating,
          ranking           : hotel.ranking.text,
          forbes_rating     : hotel.forbes_rating,
          written_time      : hotel.reviews[num].time_written,
          unixTime          : moment(hotel.reviews[num].time_written, "MM-DD-YYYY").unix(),
          written_by_mobile : hotel.reviews[num].mobile,
          user              : {
            name            : hotel.reviews[num].user_name,
            //id            : hotel.reviews[num].user_id,
            location        : hotel.reviews[num].user_location,
            level           : hotel.reviews[num].user_level,
            total_reviews   : hotel.reviews[num].total_reviews,
            hotel_reviews   : hotel.reviews[num].hotel_reviews,
            helpful_reviews : hotel.reviews[num].helpful_reviews
          },
          header            : hotel.reviews[num].header,
          time_parsed       : time_now,
          review_id         : hotel.reviews[num].review_id
        }

        Review.findOneAndUpdate({review_id : current_review.review_id}, current_review, {upsert : true}, function (err) {
          if (err) {
            console.log(err)
          }
          console.log('saved: ' + current_review.review_id)
          uploadReview(num + 1)
        })
      }
      if (hotel.reviews.length > 0) {
        uploadReview(0)
      } else {
        callback(null)
        clearTimeout(db_run_timeout)
        return
      }
    })
  })

}

module.exports = toMongo

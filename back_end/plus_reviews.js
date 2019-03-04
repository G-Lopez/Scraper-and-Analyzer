//const sleep      = require('system-sleep')
const moment     = require('moment')
const cheerio    = require('cheerio')
const mongoose   = require('mongoose')
const rp         = require('request-promise')

// --------------
// To get the more review the call must match this layout
// https://www.tripadvisor.com/ExpandedUserReviews-<hotel_code_+are_code>?
// target=<first_review_id>&
// reviews=<first_review_id>,<review_id> **comma seperated
// Example:
// https://www.tripadvisor.com/ExpandedUserReviews-g60763-d217630?target=410798213&reviews=410798213,409629894,408260558,408220605,408051626,407880905,407878786
// ---------------

console.log('running: ', 'plus_reviews')

let helpConfig = {
  on : 1,
}

function help(message) {
  if (helpConfig.on) {
    console.log(message)
  }
}

// Init:
// Set up connection to mongo

// Data Models

let Review = mongoose.model(
  'Review',
  {
    id                : Number,
    review_id         : Number,
    name              : String,
    rating            : Number,
    written_time      : String,
    unixTime          : Number,
    written_by_mobile : Boolean,
    user : {
      name            : String,
      id              : Number,
      location        : String,
      //lvl             : String,
      total_reviews   : Number,
      hotel_reviews   : Number,
      helpful_reviews : Number
    },
    header            : String,
    text              : String,
    time_parsed       : String,
    response : {
      text            : String,
      time            : String
    },
    ranking           : String,
    general_rating    : String,
    forbes_rating     : String,
    parse_is_partial  : Boolean
    //,
    //categories : {
    //  cleanliness   : {type : Number, required : 0},
    //  rooms         : {type : Number, required : 0},
    //  service       : {type : Number, required : 0},
    //  location      : {type : Number, required : 0},
    //  sleep_quality : {type : Number, required : 0},
    //  value         : {type : Number, required : 0}
    //}
  }
)

let Hotel = mongoose.model(
  'Hotel',
  {
    name          : {type : String, required : 0},
    url           : {type : String, required : 0},
    id            : {type : Number, required : 0},
    address       : {type : String, required : 0},
    room_num      : {type : Number, required : 0},
    certificate   : {type : Boolean, required : 0},
    tags          : [String],
    keywords      : [String],
    forbes_rating : {type : Number, required : 0},
    time_parsed   : String,
    ranking       : String,
    general_rating: String
  }
)

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

db.on('open', () => {
  begin()
})

// Queries:

let getHotelIds = Hotel.find({}, {_id : 0, id: 1, url : 1})

// Step 1: Get all hotel ids

// Step 2: Search for all reviews with that hotel id

// Step 3: Do string operations to specifiy the hotel

// Step 4: Get the first review id

// Step 5: Make the call

// Step 6: Parse review and extras

// Step 7: Update the reviews by each id

// Step 8: Go to the next hotel id

const tripadvisor = 'https://www.tripadvisor.com/'

let hotels = []

function begin() {
  // Start off by getting all the ids
  getHotelIds.exec((err, db_hotels) => {
    hotels = db_hotels
    getExpandedReviewsFromHotel(0)
  })
}

function getExpandedReviewsFromHotel(num) {
  if (num >= hotels.length) {
    console.log('done')
    //-- turn it off
    process.exit()
    return
  }
  let call_part_hotel_and_area = hotels[num].url.split('-')[1] + '-' + hotels[num].url.split('-')[2]
  help(call_part_hotel_and_area)
  //{id : hotels[num].id, text : {$exists: true}, "response.text" : null}
  Review.find({ $or : [{id : hotels[num].id, text : {$exists: false}}]}, {_id : 0, review_id : 1}).exec((err, db_review_ids) => {
    review_ids = db_review_ids.map((review) => review.review_id)
    help(review_ids)

    function getReviewAndUpdate(rev_num) {
      if (rev_num >= db_review_ids.length) {
        getExpandedReviewsFromHotel(num + 1)
        return
      }
      // now time to formulate the call
      let httpCall = tripadvisor + 'ExpandedUserReviews-' + call_part_hotel_and_area + '?' + 'target=' + review_ids[rev_num] + '&reviews=' + review_ids[rev_num]
      help(httpCall)

      rp({uri : httpCall, transform: function (body) {return cheerio.load(body)}})
      .then($ => {
        let review_text = $('.entry').first().text().replace(/(\r\n|\(|\)|\n|\r|)/gm,"").replace(/(\"|\')/gm, "'").trim()
        let review_response
        if ($('.displayText').text()) {
          review_response = $('.displayText').text().replace(/(\r\n|\(|\)|\n|\r|)/gm,"").replace(/(\"|\')/gm, "'").trim()
        }
        help('review: ' + review_text)
        help('---------------------------------------')
        help('hotel response: ' + review_response)
        Review.findOneAndUpdate({"review_id" : review_ids[rev_num]}, {text : review_text, "response.text" : review_response, "parse_is_partial" : false}, err => {
          if (err) {
            help(err)
          }
          console.log('updated:' + review_ids[rev_num])
          help('---------------> NEXT <------------------')
          getReviewAndUpdate(rev_num + 1)
        })
      })
      .catch(err => {
        help(err)
        getReviewAndUpdate(rev_num + 1)
      })
    }
    getReviewAndUpdate(0)
  })
}

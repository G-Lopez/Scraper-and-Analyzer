const mongoose = require('mongoose')
let Schema = mongoose.Schema
//DATA MODEL
module.exports = {
  Hotel : Hotel,
  Snapshot : Snapshot,
  Review : Review
}

var Hotel = new Schema(
  {
    name          : String,
    city          : String,
    url           : String,
    id            : Number,
    address       : String,
    room_num      : Number,
    certificate   : Boolean,
    tags          : [String],
    keywords      : [String],
    forbes_rating : Number,
    time_parsed   : Number,
    ranking       : String,
    general_rating: String
  }
)

var Review = new Schema(
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
    time_parsed       : Number,
    response : {
      text            : String,
      time            : String
    },
    ranking           : String,
    general_rating    : String,
    forbes_rating     : String
  }
)

var Snapshot = new Schema(
  {
    id      : Number,
    name    : String,
    ranking : {
      text : String,
      num : Number,
      total : Number
    },
    ratings : {
      general   : Number,
      total_reviews : Number,
      excellent : Number,
      very_good : Number,
      average   : Number,
      poor      : Number,
      terrible  : Number
    },
    time_parsed : Number,
    forbes_rating: String
  }
)

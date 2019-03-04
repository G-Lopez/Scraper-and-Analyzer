const mongoose = require('mongoose')
const getStateFromAddress = require('./getStateFromAddress')
mongoose.connect('mongodb://jshom:jshom@ds031186-a0.mlab.com:31186,ds031186-a1.mlab.com:31186/trip-alice?replicaSet=rs-ds031186',{
    server: { socketOptions: {
      keepAlive: 1,
      connectTimeoutMS: 30000 }
    },
    replset: {
      socketOptions: {
        keepAlive: 1,
        connectTimeoutMS : 30000
      }
    }
  })
let db = mongoose.connection
const Hotel = mongoose.model(
  'Hotel',
  {
    name           : String,
    city           : String,
    state          : String,
    url            : String,
    id             : Number,
    address        : String,
    room_num       : Number,
    certificate    : Boolean,
    tags           : [String],
    keywords       : [String],
    forbes_rating  : Number,
    time_parsed    : String,
    ranking        : String,
    general_rating : String,
    g_maps_data    : {
      id           : String,
      address      : String,
      coordinates  : {
        lat        : Number,
        lng        : Number
      }
    }
  }
)

db.on('open', () => {
  Hotel.find({ state : { $exists : false } }, { address : 1, _id : 0, id : 1 }).exec(function (err, hotels) {
    function updateState (num, clb) {
      if (num === hotels.length) {
        clb()
        return
      }

      let state = getStateFromAddress(hotels[num].address)
      console.log(hotels[num].address)
      console.log(state)
      console.log(hotels[num].id)
      Hotel.update({ id  : hotels[num].id }, { state : state }, { upsert : false }, (err, res) => {
        console.log('--------')
        updateState(num + 1, clb)
      })
    }
    updateState(0, function () {
      db.close()
    })
  })
})

// :::::::::::::::::::::::
// :: FALSE FOR TESTING ::
const production = true
// :::::::::::::::::::::::

const express = require('express')
const mongoose = require('mongoose')
const assert = require('assert');
const Promises = require('promises');
const moment = require('moment');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://jshom:jshom@ds031186-a0.mlab.com:31186,ds031186-a1.mlab.com:31186/trip-alice?replicaSet=rs-ds031186'
const https = require('https')
const fs = require('fs')
const json2csv = require('json2csv');
// Mongoose Setup

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
let mongus = mongoose.connection

let adminData = []

mongus.on('open', () => {
  city_count = 0
  let first = [/./]
  setInterval(() => {
    Hotel.find().distinct('city', function(err, city_names) {
        newRes = []
        newRes.length = 0
        city_names = city_names.sort()
        city_names = first.concat(city_names)
        //console.log(city_names)
        function getCityCount(num) {
            if (num == city_names.length - 1) {
                //console.log(newRes)
                adminData = newRes
                //process.exit()
                return
            }
            Hotel.find({'city': city_names[num]}).exec((err, hotels) => {
                let hotelIds = hotels.map(hotel => hotel.id)
                Review.find().where('id').in(hotelIds).count().exec((err, reviews_count) => {
                    Snapshot.find().where('id').in(hotelIds).count().exec((err, snapshot_count) => {
                      Review.find({'text' : {$exists : true}}).where('id').in(hotelIds).count().exec((err, completed_reviews) => {
                        Hotel.find({sf_account_id : { $exists : true }}).where('id').in(hotelIds).count((err, matched_accounts) => {
                          let state = ''
                          if (city_names[num].toString().includes('/')) {
                            state = 'ALL'
                          } else {
                            state = hotels[0].state ? hotels[0].state : '--'
                          }
                          newRes.push({
                              name                  : city_names[num].toString().includes('/') ? 'ALL' : city_names[num],
                              state                 : state,
                              hotelCount            : hotels.length,
                              snapshotCount         : snapshot_count,
                              reviewCount           : reviews_count,
                              completeReviews       : completed_reviews,
                              incompleteReviews     : reviews_count - completed_reviews,
                              percentageCompletion  : (completed_reviews/reviews_count * 100).toFixed(2) + '%',
                              salesforceMatched     : matched_accounts,
                              percentageMatched     : (matched_accounts/hotels.length * 100).toFixed(2) + '%'
                          })
                          //console.log(newRes[num])
                          getCityCount(num + 1)
                        })
                      })
                    })
                })
            })
        }
        getCityCount(0)
    })
  }, 1000 * 60 * 5)
})

var Hotel = mongoose.model(
  'Hotel',
  {
    name           : {type : String, required : 0},
    city           : String,
    state          : String,
    url            : {type : String, required : 0},
    id             : {type : Number, required : 0},
    address        : {type : String, required : 0},
    room_num       : {type : Number, required : 0},
    certificate    : {type : Boolean, required : 0},
    tags           : [String],
    keywords       : [String],
    forbes_rating  : {type : Number, required : 0},
    time_parsed    : String,
    ranking        : String,
    general_rating : String,
    user_tags      : [String]
  }
)

var Review = mongoose.model(
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
    forbes_rating     : String
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

var Snapshot = mongoose.model(
  'Snapshot',
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
    time_parsed : String,
    forbes_rating: String
  }
)

//Express setup
//------
const port = 8080
const app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

/*--------------------Hotel Retrieval Methods--------------------*/
//Executes all the filters on the hotel collection
let hotelFilterFunc = function(db, callback, innerMatch) {
  console.log("hotelFilterFunc", innerMatch);
  db.collection('hotels').aggregate(
    [
      {
        $match: innerMatch
      },
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1
        }
      },
      {
        $sort:{
          name: 1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};
//Executes all the filters on the reviews collection
let reviewsFilterFunc = function(db, callback, innerMatch) {
  console.log("reviewsFilterFunc", innerMatch);
  db.collection('reviews').aggregate(
    [
      {
        $match: innerMatch
      },
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1
        }
      },
      {
        $group:{
          _id: "$id",
          id: {$max: "$id"},
          name: {$max: "$name"}

        }
      },
      {
        $project:{
          _id: 0,
          id: 1,
          name: 1
        }
      },
      {
        $sort:{
          name: 1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};
//Executes all the filters on the snapshots collection
let snapshotsFilterFunc = function(db, callback, innerMatch) {
  console.log("snapshotsFilterFunc", innerMatch);
  db.collection('snapshots').aggregate(
    [
      {
        $match: innerMatch
      },
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1
        }
      },
      {
        $sort:{
          name: 1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};

//Getters for the hotel info, first 10 reviews, and
//snapshot info for a hotel given an ID
let hotelobj = function(db, callback, id) {
    db.collection('hotels').aggregate(
      [
        {
          $match:{
            id: id
          }
        }
      ]).toArray(function(err, result) {
        assert.equal(err, null);
        callback(result);
      });
}

let reviewsobj = function(db, callback, id) {
    db.collection('reviews').aggregate(
      [
        {
          $match:{
            id: id
          }
        }
      ]).limit(50).toArray(function(err, result) {
        assert.equal(err, null);
        callback(result);
      });
}

let snapshotobj = function(db, callback, id) {
    db.collection('snapshots').find({id: id}
    ).sort({time_parsed: -1}).limit(1).toArray(function(err, result) {
        assert.equal(err, null);
        callback(result);
      });
}

//Filters for Reviews once hotel is selcted
let relevantReviewsFunction = function(db, callback, innerMatch) {
  innerMatch.text = { $exists : true }
  db.collection('reviews').aggregate(
    [
      {
        $match: innerMatch
      },
      {
        $sort:{
          unixTime: -1
        }
      }
    ]).limit(50).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
}

//Helper functions that checks if a given element exists in a given array
let objChecker = function(array, elem) {
  let e = JSON.stringify(elem);
  let truth = false;
  array.some(function(item){
    let z = JSON.stringify(item);
    if(e == z){
      truth = true;
      return true
    }
  })
  return truth;
};

//Given an array of arrays of objects, returns a list of objects that exist in
//all the the arrays
let finalArray = function(count, arr, givenres) {
  if(count == 0){
    return arr;
  }
  else{
    let tempArr = [];
    arr.forEach(function(item) {
      if(objChecker(givenres[count], item)){
        tempArr.push(item);
      }
    })
    count--;
    return finalArray(count, tempArr, givenres);
  }
};

// ----------------- SECTION FOR GOOGLE AUTHENTICATION -----------------------//
//- New Requires
const g_data        = require('./g_data').web // Auth details from json
const google        = require('googleapis')   // Google API SDK
const crypto        = require('crypto')       // For encryption of tickets
const cookieParser  = require('cookie-parser')
const plus          = google.plus('v1')
const OAuth2        = google.auth.OAuth2
const bodyParser    = require('body-parser')

app.use(cookieParser())
app.use(bodyParser.json())
//- Init the Google Auth Portal
const CLIENT_ID        = g_data.client_id
const CLIENT_SECRET    = g_data.client_secret
const REDIRECT_URL     = 'https://trip.aliceapp.com:8080/oauth2callback'
const oauth2Client     = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
const googleAuthScopes = ['profile', 'email']
const gAuthUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope : googleAuthScopes
})
let encryptTicket = text => crypto.createHmac('sha256', text).update(text).digest('hex')
let VALIDATED_USERS = []

//- The login gate for admin
app.all('/admin', (req, res, next) => {
  let ticket = req.query.ticket
  console.log(ticket)
  console.log(VALIDATED_USERS)
  if (!ticket || VALIDATED_USERS.indexOf(ticket) === -1) {
    res.send('<h3>login here <a href="https://trip.aliceapp.com:8080/login">LOGIN</a>. Or it doesn\'t look you using your work account. Please try again</h3>')
  } else {
    next()
  }
})
app.get('/login', (req, res) => res.redirect(gAuthUrl))
app.all('/oauth2callback', (req, res) => {
  let code = req.query.code
  oauth2Client.getToken(code, function(err, tokens) {
    if (err) {
      console.log('err')
      return
    }
    oauth2Client.setCredentials(tokens)
    plus.people.get({ auth: oauth2Client, userId : 'me' }, function(err, user) {
      let id = encryptTicket(user.id)
      res.cookie('ticket', id, { path: '/' })
      if (user.domain === 'alice-app.com' && VALIDATED_USERS.indexOf(id) === -1) {
        VALIDATED_USERS.push(id)
      }
      res.redirect('https://trip.aliceapp.com/admin.html')
    })
  })
})

// -- ADMIN PANEL
app.get('/admin', (req, res) => {
  let html = '<h1>Data Overview</h1><div id="theTable" class="table-responsive"><table class="table table-bordered table-striped table-hover"><tr><th>NAME</th><th>STATE</th><th class="text-right">HOTEL COUNT</th><th class="text-right">SNAPSHOT COUNT</th><th class="text-right">REVIEW COUNT</th><th class="text-right">FULL REVIEWS</th><th class="text-right">EMPTY REVIEWS</th><th class="text-right">PERCENTAGE COMPLETION</th><th class="text-right">SALESFORCE MATCHED ACCOUNTS</th><th class="text-right">MATCH PERCENTAGE</th><tr>'
  for (city of adminData) {
    let cityHtml = '<tr>'
    for (key in city) {
      //console.log(key)
      if (Number.isInteger(city[key]) || city[key].includes('%')) {
        cityHtml = cityHtml.concat('<td align="right">' + city[key].toLocaleString() + '</td>')
      } else {
        cityHtml = cityHtml.concat('<td>' + city[key] + '</td>')
      }
    }
    cityHtml+='</tr>'
    html+=cityHtml
  }
  html+='</table></div>'
  res.send(html)
})

app.get('/admin_data', (req, res) => res.json(adminData))
// END ADMIN PANEL


//Express handler that outputs relevant reviews given a
//hotel ID and review filters you want to implement.
app.get('/reviews/:hotelID/:rfilter', function(req, res){
  let rfilters = req.query;
  console.log("Rfilters", rfilters);
  let rresponses = [];
  let hID = Number(req.params.hotelID);
  let rrevMatchObj = {id: hID};
  MongoClient.connect(url, function(err, db){
    if(rfilters.wordSearch){
      let connectedWords = rfilters.wordSearch.split(', ').join('|')
      let wordsInRegExp = new RegExp(connectedWords, "i")
      rrevMatchObj.text = wordsInRegExp;
    }

    if(rfilters.reviewTime){
      let myNum = moment().subtract(rfilters.reviewTime, 'days').unix();
      rrevMatchObj.unixTime = {$gt: myNum};
    }

    if(rfilters.reviewRatingEQ){
      let myNum = Number(rfilters.reviewRatingEQ);
      rrevMatchObj.rating = myNum
    }

    if(rfilters.reviewRatingGT){
      let myNum = Number(rfilters.reviewRatingGT);
      rrevMatchObj.rating = {$gt: myNum};
    }

    if(rfilters.reviewRatingLT){
      let myNum = Number(rfilters.reviewRatingLT);
      rrevMatchObj.rating = {$lt: myNum};
    }

    let p = new Promise(function(resolve, reject){
      //console.log(rrevMatchObj);
      relevantReviewsFunction(db, function(result) {
        rresponses.push(result);
        resolve('Success');
      }, rrevMatchObj);
    }).then(function(success) {
        console.log("In filters then");
        //console.log(rresponses);
        res.json(rresponses[0]);
    })
  })
});

// ::::::::::::::::::::::::::::::::::::::::::::::: //
// :::::::::::::::::::: HISTORY :::::::::::::::::: //
// ::::::::::::::::::::::::::::::::::::::::::::::: //
let historyFunction = function (id, startDate, endDate, clb) {
  let start = startDate || 0
  let end = endDate || 0

  Snapshot.find({id : id}, { time_parsed : 1, forbes_rating : 1, ratings : 1, ranking : 1 }, (err, snaphots) => {

    if (start !== end) {
      start = moment(start).unix()
      end = moment(end).unix()
      clb(snaphots.filter(snap => (Number(snap.time_parsed) > start && Number(snap.time_parsed) < end)))
    } else {
      clb(snaphots)
    }

  })
}

app.get('/history/:id', (req, res) => {

  historyFunction(req.params.id, req.query.start, req.query.end, snapshots => {
    res.json(snapshots)
  })

})

app.get('/snapshotcsv', (req, res) => {

  historyFunction(req.query.id, req.query.start, req.query.end, snapshots =>{

    snapshots.forEach(obj => {
      let date = new Date(obj['time_parsed'] * 1000)
      obj['time_parsed'] = '' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()

      for(let key in obj){
        if(typeof(obj[key]) === 'object' ){
          if(key === 'ratings'){
            obj['review_rating_average'] = obj[key].general
            obj['total_reviews'] = obj[key].total_reviews
            obj['excellent_reviews'] = obj[key].excellent
            obj['very_good_reviews'] = obj[key].very_good
            obj['average_reviews'] = obj[key].average
            obj['poor_reviews'] = obj[key].poor
            obj['terrible_reviews'] = obj[key].terrible
            delete obj[key]
          }
          else if(key === 'ranking'){
            obj['rank'] = obj[key].num
            obj['total'] = obj[key].total
            delete obj[key]
          }
        }
      }
    })

    let fields = ['time_parsed', '_id', 'forbes_rating', 'review_rating_average', 'total_reviews', 'excellent_reviews', 'very_good_reviews', 'average_reviews', 'poor_reviews', 'terrible_reviews', 'rank', 'total']
    try{
      let result = json2csv({data: snapshots, fields })
      res.send(result)
    } catch(err) {
      console.log(err);
      res.send('Was not able to convert, error occured.')
    }
  })

})

// ::::::::::: //
// END HISTORY //
// ::::::::::: //

//Returns the full hotel object with reviews and
//snapshots given an ID
app.get('/hotels/:hotelID', function(req, res){
  MongoClient.connect(url,function(err, db){
    let retrievalID = Number(req.params.hotelID)
    console.log(retrievalID)
    let hotelInfo = {}
    let p = new Promise(function(resolve, reject){
      hotelobj(db, function(result) {
        hotelInfo.hotel = result;
        console.log("Getting Hotel");
      }, retrievalID);
      snapshotobj(db, function(result) {
        console.log("Getting Snapshot");
        hotelInfo.snapshot = result;
      }, retrievalID);
      reviewsobj(db, function(result) {
        console.log("Getting Reviews");
        hotelInfo.reviews = result;
        resolve("Success");
      }, retrievalID);

    }).then(function(success){
      //console.log(success);
      //console.log(hotelInfo);
      res.json(hotelInfo);
        db.close();
    })
  })
})
//Returns a list of hotels given some filters
app.get('/search/:filters', function (req, res) {
  let responses = []
  let filters = req.query;
  console.log(filters)
  let revMatchObj = {};
  let hotMatchObj = {};
  let snapMatchObj = {};


  MongoClient.connect(url, function(err, db) {

    //-- certificate t/f
    if (filters.certificate) {
      myBool = (filters.certificate === 'true') || (filters.certificate === 'yes')
      hotMatchObj.certificate = myBool;
    }

    //-- hotel name
    if (filters.hotelName) {
      let hName = new RegExp(filters.hotelName, "i");
      hotMatchObj.$text = {$search: filters.hotelName}
    }

    //-- id search
    if(filters.hotelID) {
      let myNum = Number(filters.hotelID);
      hotMatchObj.id = myNum;
    }

    if (filters.userTag) {
      let tag = filters.userTag;
      hotMatchObj.user_tags = tag;
    }

    if (filters.forbesEQ) {
      let myNum = Number(filters.forbesEQ);
      hotMatchObj.forbes_rating = myNum;
    }

    if (filters.forbesGT) {
      let myNum = Number(filters.forbesGT);
      hotMatchObj.forbes_rating = {$gt: myNum};
    }

    if (filters.forbesLT) {
      let myNum = Number(filters.forbesLT);
      hotMatchObj.forbes_rating = {$lt: myNum};
    }

    //-- room nums greater than x
    if (filters.roomGT) {
      let myNum = Number(filters.roomGT);
      hotMatchObj.room_num = {$gt: myNum};
    }

    if (filters.roomLT) {
      let myNum = Number(filters.roomLT);
      hotMatchObj.room_num = {$lt: myNum};
    }
    if (filters.city) {
      let cityreg         = new RegExp(filters.city.replace(/, /g, '|'), "i")
      hotMatchObj.address = cityreg
    }

    if (filters.state) {
      let stateRegex = new RegExp(filters.state, "i")
      hotMatchObj.address = stateRegex;
    }

    // -- Black List Name Filter
    if (filters.excludename) {
      let exNameReg = new RegExp(filters.excludename.replace(/, /gm,'|'), 'igm')
      hotMatchObj.name = { $not : exNameReg }
    }

    // -- Salesforce Matched
    if(filters.hasSalesforceAccount) {
      let hasAcc = filters.hasSalesforceAccount
      if (hasAcc.toLowerCase() === 'yes' || hasAcc.toLowerCase() == 'true') {
        hotMatchObj.sf_account_id = { $exists : true }
      } else {
        hotMatchObj.sf_account_id = { $exists : false }
      }
    }

    // -- Reviews
    if (filters.wordSearch) {
      let connectedWords = filters.wordSearch.split(', ').join('|')
      let wordsInRegExp = new RegExp(connectedWords, "igm")
      revMatchObj.text = wordsInRegExp;
    }
    if(filters.wordSearchOR){
      let connectedWords = rword.split(', ').join('|')
      let wordsInRegExp = new RegExp(connectedWords, "i")

    }

    if (filters.reviewTime) {
      let myNum = moment().subtract(filters.reviewTime, 'days').unix();
      revMatchObj.unixTime = {$gt: myNum};
    }

    if(filters.reviewRatingEQ){
      let myNum = Number(filters.reviewRatingEQ);
      revMatchObj.rating = myNum;
    }

    if(filters.reviewRatingGT){
      let myNum = Number(filters.reviewRatingGT);
      revMatchObj.rating = {$gt: myNum};
    }
    if(filters.reviewRatingLT){
      let myNum = Number(filters.reviewRatingLT);
      revMatchObj.rating = {$lt: myNum};
    }

    // if (Object.keys(hotMatchObj).length > 1) {
    //   revMatchObj.text = { $exists : true }
    // }

//snapshots
    if (filters.rankingGT) {
      let myNum = Number(filters.rankingGT);
      snapMatchObj["ranking.num"] = {$lt: myNum}
    }

    if (filters.rankingLT) {
      let myNum = Number(filters.rankingLT);
      snapMatchObj["ranking.num"] = {$gt: myNum}
    }

    if (filters.totalReviewsGT) {
      let myNum = Number(filters.totalReviewsGT);
      snapMatchObj["ratings.total_reviews"] = {$gt: myNum};
    }

    if (filters.totalReviewsLT) {
      let myNum = Number(filters.totalReviewsLT);
      snapMatchObj["ratings.total_reviews"] = {$lt: myNum};
    }

    if (filters.generalRatingEQ) {
      let myNum = Number(filters.generalRatingEQ);
      snapMatchObj["ratings.general"] = myNum;
    }

    if (filters.generalRatingGT) {
      let myNum = Number(filters.generalRatingGT);
      snapMatchObj["ratings.general"] = {$gt: myNum};
    }

    if (filters.generalRatingLT) {
      let myNum = Number(filters.generalRatingLT);
      snapMatchObj["ratings.general"] = {$lt: myNum};
    }

    if (filters.excellentRatingGT) {
      let myNum = Number(filters.excellentRatingGT);
      snapMatchObj["ratings.excellent"] = {$gt: myNum};
    }

    if (filters.excellentRatingLT) {
      let myNum = Number(filters.excellentRatingLT);
      snapMatchObj["ratings.excellent"] = {$lt: myNum};

    }

    if (filters.vGoodRatingGT) {
      let myNum = Number(filters.vGoodRatingGT);
      snapMatchObj["ratings.very_good"] = {$gt: myNum};

    }

    if (filters.vGoodRatingLT) {
      let myNum = Number(filters.vGoodRatingLT);
      snapMatchObj["ratings.very_good"] = {$lt: myNum};

    }

    if (filters.averageRatingGT) {
      let myNum = Number(filters.averageRatingGT);
      snapMatchObj["ratings.average"] = {$gt: myNum};

    }

    if (filters.averageRatingLT) {
      let myNum = Number(filters.averageRatingLT);
      snapMatchObj["ratings.very_good"] = {$lt: myNum};

    }

    if (filters.poorRatingGT) {
      let myNum = Number(filters.poorRatingGT);
      snapMatchObj["ratings.poor"] = {$gt: myNum};

    }

    if (filters.poorRatingLT) {
      let myNum = Number(filters.poorRatingLT);
      snapMatchObj["ratings.poor"] = {$lt: myNum};
    }

    if (filters.terribleRatingGT) {
      let myNum = Number(filters.terribleRatingGT);
      snapMatchObj["ratings.terrible"] = {$gt: myNum};
    }

    if (filters.terribleRatingLT) {
      let myNum = Number(filters.terribleRatingLT);
      snapMatchObj["ratings.terrible"] = {$lt: myNum};
    }

    let p = new Promise(function(resolve, reject){
      let resolvevar = '';
      if(Object.keys(revMatchObj).length !==0){
        resolvevar = 'reviews';
      }
      else if(Object.keys(snapMatchObj).length !==0){
        resolvevar = 'snapshot';
      }
      else{
        resolvevar = 'hotels'
      }

      if(Object.keys(hotMatchObj).length !== 0){
        hotelFilterFunc(db, function(result) {
          responses.push(result);
          if(resolvevar === 'hotels'){
            resolve('Success');
          }
        }, hotMatchObj);
      }
      if(Object.keys(snapMatchObj).length !== 0){
        snapshotsFilterFunc(db, function(result) {
          responses.push(result);
          if(resolvevar === 'snapshots'){
            resolve('Success');
          }
        }, snapMatchObj);
      }
      if(Object.keys(revMatchObj).length !== 0){
        reviewsFilterFunc(db, function(result) {
          responses.push(result);
          if(resolvevar='reviews'){
            resolve('Success');
          }
        }, revMatchObj);
      }
    }).then(function(success) {
        console.log("In filters then");
        //console.log(responses);
        let IDList = [];
        if(responses.length > 0){
          IDList = finalArray(responses.length -1, responses[0], responses);
        }
        //console.log(IDList);
        responses = [];
        res.json(IDList);
    })
  })
})

app.post('/tag/update', (req, res) => {
  let tag = req.body
  console.log({tag})
  Hotel.findOneAndUpdate({id : tag.id}, {'$set' : { user_tags : tag.tags }}, {upsert : false}, err => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }
    res.sendStatus(200)
  })
})


if (production) {
  let httpsOptions = {
    key : fs.readFileSync('/etc/nginx/ssl/ssl.key'),
    cert: fs.readFileSync('/etc/nginx/ssl/ssl.crt')
  }
  https.createServer(httpsOptions, app).listen(port) //https
} else {
  app.listen(port) //http
}
console.log('running on %s', port)

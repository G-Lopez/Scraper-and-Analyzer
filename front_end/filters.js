"use strict";

let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
let Promises = require('promise');

//Mongo login
let url = 'mongodb://gabrielAlice:Cookies323@ds027425.mlab.com:27425/trip';
//Array of inputs from the textboxes on the webpage
//let inputArray = [4, 200, false];

let bigarray = [];
let count = -1;

/* ---------------------Filters with Mongo Queries --------------------------*/
let hotelName = function(db, callback, hname) {
  hname = `\"${hname}\"`;
  db.collection('hotels').createIndex({name: 'text'});
  db.collection('hotels').aggregate(
    [
      {
        $match: {
          $text: {
            $search: hname
          }
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
        }
      },
      {
        $sort:{
          name: -1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};

let hotelID = function(db, callback, hoteli) {
  db.collection('hotels').aggregate(
    [
      {
        $match: {
         id: hoteli
        }
      },
      {
        $project: {
          _id: 0,
          id: 1
        }
      },
      {
        $sort:{
          id: -1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};

let forbesEQ = function(db, callback, rating) {
  db.collection('hotels').aggregate(
    [
      {
        $match: {
         forbes_rating: rating
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
        }
      },
      {
        $sort:{
          id: -1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};

let forbesGT = function(db, callback, rating) {
  db.collection('hotels').aggregate(
    [
      {
        $match: {
         forbes_rating: {$gt: rating}
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
        }
      },
      {
        $sort:{
          id: -1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};

let forbesLT = function(db, callback, rating) {
  db.collection('hotels').aggregate(
    [
      {
        $match: {
         forbes_rating: {$lt: rating}
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
        }
      },
      {
        $sort:{
          id: -1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};

let roomGT = function(db, callback, room) {
  db.collection('hotels').aggregate(
    [
      {
        $match: {
         room_num: {$gt: room}
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
        }
      },
      {
        $sort:{
          id: -1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};

let roomLT = function(db, callback, room) {
  db.collection('hotels').aggregate(
    [
      {
        $match: {
         room_num: {$lt: room}
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
        }
      },
      {
        $sort:{
          id: -1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};

let certificate = function(db, callback, tf) {
  db.collection('hotels').aggregate(
    [
      {
        $match: {
         certificate: tf
        }
      },
      {
        $project: {
          _id: 0,
          id: 1,
        }
      },
      {
        $sort:{
          id: -1
        }
      }
    ]).toArray(function(err, result) {
      assert.equal(err, null);
      callback(result);
    });
};

/* ---------------------Filter Call Functions--------------------------*/

let getForbesEQ= function(db, rating){
  return new Promise(function(resolve, reject) {
    forbesEQ(db, function(result){
      bigarray.push(result);
      count++;
      resolve('Success');
    }, rating)
  });
};

let getForbesGT= function(db, rating){
    return new Promise(function(resolve, reject){
      forbesGT(db, function(result){
        bigarray.push(result);
        count++;
        resolve('Success');
      }, rating)
  });
};

let getForbesLT= function(db, rating){
    return new Promise(function(resolve, reject){
      forbesLT(db, function(result){
        bigarray.push(result);
        count++;
        resolve('Success');
      }, rating)
  });
};

let getRoomGT= function(db, room){
  return new Promise(function(resolve, reject){
    roomGT(db, function(result){
      bigarray.push(result);
      count++;
      resolve('success');
    }, room);
  });
};

let getRoomLT= function(db, room){
  return new Promise(function(resolve, reject){
    roomLT(db, function(result){
      bigarray.push(result);
      count++;
      resolve('success');
    }, room);
  });
};


let getHotelID= function(db, hoteli){
  return new Promise(function(resolve, reject){
    hotelID(db, function(result){
      bigarray.push(result);
      count++;
      resolve('success');
    }, hoteli);
  });
};
let getHotelName= function(db, hname){
  return new Promise(function(resolve, reject){
    hotelName(db, function(result){
      bigarray.push(result);
      count++;
      resolve('success');
    }, hname);
  });
};

let getCertificate = function(db, tf){
  return new Promise(function(resolve, reject){
    certificate(db, function(result){
      bigarray.push(result);
      count++;
      resolve('Success');
    }, tf)
  });
}

/* --------Returns List of ID's that satisfies all filters------------ */

//Helper functions that checks if a given element exists in a given array
let idChecker = function(array, elem) {
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

//Iterate through the array of ID's that each filter returned and return a new
//array that contains the ID's that satisfied every filter.
let finalArray = function(count, arr) {
  if(count == 0){
    return arr;
  }
  else{
    let tempArr = [];
    arr.forEach(function(item) {
      if(idChecker(bigarray[count], item)){
        tempArr.push(item);
      }
    })
    count--;
    return finalArray(count, tempArr);
  }
};

//Array of Filters to run
//let filterArray = [getForbesLT, getRoomGT, getCertificate];

//Calls filters and returns array of ID that satisfy all filters
let execute = function(filterArray, inputArray) {
  MongoClient.connect(url, function(err, db) {
    var promisesArray = [];

    filterArray.forEach(function(item, index){
      promisesArray.push(item(db, inputArray[index]))
    });

    Promise.all(promisesArray)
    .then(function(success) {
      db.close();
      var l = finalArray(count, bigarray[0]);
      console.log(l);
      return l;
    });
  });
};

execute([getForbesLT, getRoomGT, getCertificate], [4, 200, false]);
/*Tests
getForbesEQ(3.5);
getForbesGT(2.9);
getForbesLT(3);
getHotelName('Hotel Belleclaire');
getHotelID(93390);
getRoomLT(400);
getRoomGT(1500);
getCertificate(false);
*/

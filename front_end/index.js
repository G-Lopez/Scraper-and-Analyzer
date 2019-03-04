// :::::::::::::::::::::::
// :: FALSE FOR TESTING ::
const production = true
// :::::::::::::::::::::::

var myApp = angular.module('myApp', ['ngRoute'])
var nanobar;

let wordsToHighlight = ''

let mark = function() {
  $(".bulletless").unmark().mark(wordsToHighlight)
  console.log('marking')
}

myApp.controller('loginCtrl', function ($scope, $rootScope) {
  nanobar = new Nanobar()
  $rootScope.allowRequest = !production // :: if production is true then it will restrict requests as default and require auth

  $(function() {
    let user = firebase.auth().currentUser
    if (user) {
      if (user.email.split('@')[1] == 'alice-app.com' || user.email.split('@')[1] == 'aliceapp.com') {
        $scope.signInText = 'Signed In'
        $scope.$apply(function(){
          $rootScope.allowRequest = true;
        });
      } else {
        $rootScope.allowRequest = false
        $scope.signInText = 'Email Invalid'
     }
    }
  })

  $scope.signInText = 'Sign In'
  $scope.login = function () {
    firebase.auth().signInWithPopup(provider).then(result => {
      if (result.user.email.split('@')[1] == 'alice-app.com' || result.user.email.split('@')[1] == 'aliceapp.com') {
        $scope.signInText = 'Signed In';
        $scope.$apply(function() {
          $rootScope.allowRequest = true;
        })
      } else {
        $rootScope.allowRequest = false
        $scope.signInText = 'Email Invalid'
      }
    }).catch(function (err) {
      console.log(err)
      $rootScope.allowRequest = false
      $scope.signInText = 'Signing in failed'
    })
  }
})

myApp.factory('Data', function(){
    return {
      Property: [],
      SearchValue: [],
      reviewFilters: [],
      reviewFilterInputs: [],


      BooleanCoverter: function(condition)
      {
        if(condition){
          return 'Yes';
        }
        return 'No';
      },
      filtersObj :
      {
      //Hotels
      HotelName                                : 'hotelName=',
      HotelExcludeName                         : 'excludename=',
      HotelID                                  : 'hotelID=',
      HotelCertificateOfExcellence             : 'certificate=',
      HotelForbesRatingEqualTo                 : 'forbesEQ=',
      HotelForbesRatingGreaterThan             : 'forbesGT=',
      HotelForbesRatingLessThan                : 'forbesLT=',
      HotelRoomNumberGreaterThan               : 'roomGT=',
      HotelRoomNumberLessThan                  : 'roomLT=',
      HotelCity                                : 'city=',
      HotelState                               : 'state=',
      HotelOverallUserRatingEqualTo            : 'generalRatingEQ=',
      HotelOverallUserRatingGreaterThan        : 'generalRatingGT=',
      HotelOverallUserRatingLessThan           : 'generalRatingLT=',

      //User
      UserTag                                  : 'userTag=',

      //Salesforce
      "SalesforceMatched(Yes/No)"              : 'hasSalesforceAccount=',

      //Reviews
      ReviewsWordSearch                        : 'wordSearch=',
      ReviewsNoOlderThan                       : 'reviewTime=',
      ReviewsRatingEqualTo                     : 'reviewRatingEQ=',
      ReviewsRatingGreaterThan                 : 'reviewRatingGT=',
      ReviewsRatingLessThan                    : 'reviewRatingLT=',
      Mobile                                   : 'mobile=',

      //Snapshots
      SnapshotsTotalReviewNumberGreaterThan    : 'totalReviewsGT=',
      SnapshotsTotalReviewNumberLessThan       : 'totalReviewsLT=',
      SnapshotsRankingGreaterThan              : 'rankingLT=',
      SnapshotsRankingLessThan                 : 'rankingGT=',
      SnapshotsExcellentReviewsGreaterThan     : 'excellentRatingGT=',
      SnapshotsExcellentReviewsLessThan        : 'excellentRatingLT=',
      SnapshotsVeryGoodReviewsGreaterThan      : 'vGoodRatingGT=',
      SnapshotsVeryGoodReviewsLessThan         : 'vGoodRatingLT=',
      SnapshotsAverageReviewsGreaterThan       : 'averageRatingGT=',
      SnapshotsAverageReviewsLessThan          : 'averageRatingLT=',
      SnapshotsPoorReviewsGreaterThan          : 'poorRatingGT=',
      SnapshotsPoorReviewsLessThan             : 'poorRatingLT=',
      SnapshotsTerribleReviewsGreaterThan      : 'terribleRatingGT=',
      SnapshotsTerribleReviewsGreaterThan      : 'terribleRatingLT='
      },
      FilterName : function(givenArray, givenArrayUserInputs, filtersObj, reviewFilters, reviewFilterInputs)
      {
        sampleArray = givenArray.slice(0);
        sampleArray.forEach(function(item, index) {
          if(item) {
            item = item.replace(/:/gm, '');
            item = item.replace(/ /gm, '');
            sampleArray[index] = item;

            console.log(item);
          }});
        sampleArray.forEach(function(item, index) {
          if(item){
            item = filtersObj[item];
            sampleArray[index] = item;
          }

          if(item === 'wordSearch=' || item === 'reviewTime=' || item === 'reviewRatingEQ=' || item === 'reviewRatingGT=' || item === 'reviewRatingLT='){
            reviewFilters.push(item);
            reviewFilterInputs.push(givenArrayUserInputs[index]);
          }
        })

        return sampleArray;
      },
      reviewToggle : 'Switch To All Reviews'
  };
});

myApp.controller('ddController', function( $scope, Data, $rootScope ){
  // :::::::::: SETUP BASE URL :::::::::::::
  // testing url
  if (production) {
    $rootScope.url = 'https://trip.aliceapp.com:8080/';
  } else {
    $rootScope.url = 'http://localhost:8080/';
  }
  //
  // ::::::::::::::::::::::::::::::::::::::
	$scope.Data = Data;
  $scope.cities = [
    'ALL',
    'Atlanta',
    'Chicago',
    'Cozumel',
    'Dallas',
    'Denver',
    'Fort Worth',
    'Guadalaraja',
    'Houston',
    'Los Angeles',
    'Memphis',
    'Miami',
    'Monterey',
    'Myrtle Beach',
    'Nashville',
    'New Orleans',
    'New York City',
    'Oakland',
    'Orlando',
    'Philadelphia',
    'Phoenix',
    'Puerto Vallarta',
    'Queens',
    'San Antonio',
    'San Diego',
    'San Francisco',
    'San Jose',
    'Santa Barbara',
    'Scottsdale',
    'Seattle',
    'Tucson'
  ]
  $scope.filters = [
    '',
    //Hotel Filters:
    'Hotel: Name',
    'Hotel: Exclude Name',
    'Hotel: City',
    'Hotel: State',
    'Hotel: ID',
    'Hotel: Forbes Rating Equal To',
    'Hotel: Forbes Rating Greater Than',
    'Hotel: Forbes Rating Less Than',
    'Hotel: Room Number Greater Than',
    'Hotel: Room Number Less Than',
    'Hotel: Certificate Of Excellence',
    'Hotel: Overall User Rating Equal To',
    'Hotel: Overall User Rating Greater Than',
    'Hotel: Overall User Rating Less Than',

    'User: Tag',

    'Salesforce: Matched (Yes/No)',
    //Review Filters:
    'Reviews: Word Search',
    'Reviews: No Older Than',
    'Reviews: Rating Equal To',
    'Reviews: Rating Greater Than',
    'Reviews: Rating Less Than',
    //Snapshot Filters:
    'Snapshots: Total Review Number Greater Than',
    'Snapshots: Total Review Number Less Than',
    'Snapshots: Ranking Greater Than',
    'Snapshots: Ranking Less Than',
    'Snapshots: Excellent Reviews Great Than',
    'Snapshots: Excellent Reviews Less Than',
    'Snapshots: Very Good Reviews Greater Than',
    'Snapshots: Very Good Reviews Less Than',
    'Snapshots: Average Reviews Greater Than',
    'Snapshots: Average Reviews Less Than',
    'Snapshots: Poor Reviews Greater Than',
    'Snapshots: Poor Reviews Less Than',
    'Snapshots: Terrible Reviews Greater Than',
    'Snapshots: Terrible Reviews Less Than'
  ]


  /* $scope.newParam = function() {
    var docTest = document.getElementById("top");
    var newDiv = document.createElement('div');
    document.getElementById("demo").id = "newid";
    var dd = document.createElement('select');
    var ddop = document.createElement('option');
    var text = document.createElement('input');

    ddop.value = 'value1';
    ddop.text = 'op 1';
    dd.add(ddop);

    text.type = text;

    newDiv.appendChild(dd);
    newDiv.appendChild(text);

    test.appendChild(newDiv);

  } */
});

myApp.controller('sResController', function( $scope, $rootScope, $http, Data ){
	$scope.Data = Data;

  if ($rootScope.allowRequest) {
    $('html').keypress(function(event) {
      if (event.keyCode === 13) {
        $scope.search()
      }
      if (event.keyCode === 104) {
        mark()
      }
    })

  }

  $scope.isSearched = function() {
    if($rootScope.hotels){
      return true;
    }
    return false;
  }

  $scope.search = function(){
      // -- City Filter #1 on the UI
      let city = $('#city').val()
      city = city === 'ALL' ? null : city
      console.log(city)
      // -- loading signal
      nanobar.go(55 * Math.random())
      // -- Tools for highlighting. This is getting the raw text and putting it into the variable
      $("*").unmark()
      let searchHasWordSearch = false
      if ($scope.Data.reviewFilters.indexOf('wordSearch=') != -1) {
        let wordSearchIteration = $scope.Data.reviewFilters.indexOf('wordSearch=')
        wordsToHighlight = $scope.Data.reviewFilterInputs[wordSearchIteration].replace(/, /g, ' ')
        searchHasWordSearch = true
      }

      $scope.Data.reviewFilters = [];
      $scope.Data.reviewFilterInputs = [];
      let tempAr = $scope.Data.FilterName($scope.Data.Property, $scope.Data.SearchValue, $scope.Data.filtersObj, $scope.Data.reviewFilters, $scope.Data.reviewFilterInputs);
      console.log('Searching...');
      let urlAddOn = 'search/filters?';

      tempAr.forEach(function(item, index){
        urlAddOn += item + escape($scope.Data.SearchValue[index]) + '&'
      })

      // -- Add city to the query, if specified

      if (city && !urlAddOn.includes('city=')) {
        urlAddOn += `&city=${city}`
      }

      urlAddOn = urlAddOn.substring(0, urlAddOn.length - 1);
      console.log($rootScope.url + urlAddOn);
      $http.get($rootScope.url + urlAddOn)
        .success(function(hotels) {
          // -- Change loading back to search for hotels
          nanobar.go(100)
          $rootScope.hotels = hotels;
          $rootScope.hotelNum = hotels.length;
          $rootScope.pageArray = [0,1,2,3,4,5,6,7,8,9];
          if (searchHasWordSearch) mark()
          console.log(hotels.length)
        });

  };

//Once User Picks a hotel from the results list, this is called.
  $scope.setHotel = function(selHotelID){
    nanobar.go(70 * Math.random())
    $scope.Data.reviewtoggle = 'Switch To All Reviews';
    $http.get($rootScope.url + 'hotels/' + selHotelID)
      .success(function(reqHotel){
        console.log('reqhotel', reqHotel)
        $rootScope.hotel = reqHotel
        $rootScope.genReviews = reqHotel.reviews;
        $rootScope.genReviewsCount = reqHotel.reviews.length;
        nanobar.go(100)
    })

    let rURLAddOn = 'reviews?';
    $scope.Data.reviewFilters.forEach(function(item, index) {
      rURLAddOn += item + escape($scope.Data.reviewFilterInputs[index]) + '&';
    })
    if($scope.Data.reviewFilters.length === 0){
      rURLAddOn += 'none=true&';
    }
    rURLAddOn = rURLAddOn.substring(0, rURLAddOn.length -1);
    console.log($rootScope.url + 'reviews/' + selHotelID + '/' + rURLAddOn);
    $http.get($rootScope.url + 'reviews/' + selHotelID + '/' + rURLAddOn)
      .success(function(reviews) {
        $rootScope.reviews = reviews;
        $rootScope.reviewsCount = reviews.length;
        console.log('Review Count: ', $rootScope.reviewsCount);
      })
  };
});

//Controls the right side of the page, in charge of displaying the information
//on the current selected hotel.
myApp.controller('selHotelController', function($scope, $rootScope, $http, Data){
  $scope.Data = Data;
//  $scope.Data.reviewtoggle = 'All Reviews'


  $scope.getAddress = function() {
    if($rootScope.hotel){
    return 'Address: ' + $rootScope.hotel.hotel[0].address
    }
    return ''
  }

  $scope.showID = function () {
    if($rootScope.hotel) {
      return $rootScope.hotel.hotel[0].id
    }
  }

  $scope.getSalesforceLink = function () {
    if($rootScope.hotel) {
      return 'https://na24.salesforce.com/' + $rootScope.hotel.hotel[0].sf_account_id
    } else {
      return ''
    }
  }

  $scope.showSalesforceLink = function () {
    if($rootScope.hotel) {
      return 'Link to Salesforce Account'
    } else {
      return 'No SF Account'
    }
  }

  $scope.showPhone = function () {
    if($rootScope.hotel) {
      return 'Phone Number: ' +  $rootScope.hotel.hotel[0].phone_number
    } else {
      return ''
    }
  }

  $scope.isSel = function() {
    if($rootScope.hotel){
      return true
    }
    return false
  }

  $scope.getURL = function() {
    if($rootScope.hotel){
      return "" + $rootScope.hotel.hotel[0].url
    }
  }
  $scope.getRanking = function() {
    if($rootScope.hotel){
      return 'Ranking: ' + $rootScope.hotel.snapshot[0].ranking.text;
    }
    return '';
  }
  //Hotel metadata Getter Methods
  $scope.getCertificate = function() {
    if($rootScope.hotel){
    return 'Certificate of Excellence: ' + Data.BooleanCoverter($rootScope.hotel.hotel[0].certificate);
    }
    return '';
  }
  $scope.getRooms = function() {
    if($rootScope.hotel){
      return 'Number of Rooms: ' + $rootScope.hotel.hotel[0].room_num;
    }
    return '';
  }
  $scope.getForbes = function() {
    if($rootScope.hotel){
      if($rootScope.hotel.hotel[0].forbes_rating !== -1){
        return 'Forbes Rating: ' + $rootScope.hotel.hotel[0].forbes_rating;
      }
      else{
        return 'Forbes Rating: None'
      }
      return 'Forbes Rating: No Rating';
    }
    return '';
  }
  $scope.getOverallR = function() {
    if($rootScope.hotel){
      return 'Overall User Rating: ' + $rootScope.hotel.snapshot[0].ratings.general;
    }
    else{
      return '';
    }
  }

  $scope.getExcellentR = function() {
    if($rootScope.hotel){
      return 'Excellent: ' + $rootScope.hotel.snapshot[0].ratings.excellent;
    }
    else{
      return '';
    }
  }

  $scope.getGoodR = function() {
    if($rootScope.hotel){
      return 'Very Good: ' + $rootScope.hotel.snapshot[0].ratings.very_good;
    }
    else{
      return '';
    }
  }

  $scope.getAverageR = function() {
    if($rootScope.hotel){
      return 'Average: ' + $rootScope.hotel.snapshot[0].ratings.average;
    }
    else{
      return '';
    }
  }

  $scope.getPoorR = function() {
    if($rootScope.hotel){
      return 'Poor: ' + $rootScope.hotel.snapshot[0].ratings.poor;
    }
    else{
      return '';
    }
  }

  $scope.getTerribleR = function() {
    if($rootScope.hotel){
      return 'Terrible: ' + $rootScope.hotel.snapshot[0].ratings.terrible;
    }
    else{
      return '';
    }
  }



  $scope.getTags = function() {
    if($rootScope.hotel){
      var tagString = '';
      $rootScope.hotel.tags.forEach(function(tag){
        tagString += tag + ', ';
      });
      tagString = tagString.substring(0, (tagString.length -2));
      return 'Tags: ' + tagString;
    }
    return '';
  }


  //Review Methods
  $scope.reviewCheck = function() {
    if($rootScope.hotel){
      $scope.reviewSearch();
    }
    else{
      return '';
    }
  }

  $scope.getResponseText = function(reviewInput) {
    if(reviewInput.response.text) {
      return reviewInput.response.text
    }
    return "No Repsonse"
  }

  $scope.highlightKeywords = function () {
    mark()
  }

  // ----------------------------
  // :: SECTION FOR MANAGING TAGS
  // ----------------------------
  $scope.localTags = []

  $scope.setUserTags = function () {
    if(!$rootScope.hotel) return
    if(!$rootScope.hotel.hotel[0].user_tags) return $scope.hotel.hotel[0].user_tags = []

    $scope.localTags = $rootScope.hotel.hotel[0].user_tags
  }

  $scope.addTag = function () {
    $rootScope.hotel.hotel[0].user_tags.push('')
    $scope.localTags = $rootScope.hotel.hotel[0].user_tags
  }

  $scope.deleteLastTag = function () {
    $rootScope.hotel.hotel[0].user_tags.pop()
    $scope.localTags = $rootScope.hotel.hotel[0].user_tags
  }

  $scope.saveStateOfTags = function() {
    $http.post(($rootScope.url + 'tag/update'), {
      id   : $rootScope.hotel.hotel[0].id,
      tags : $scope.localTags
    }, res => {
      console.log(res)
      alert('changes, saved')
    })
  }

  // -----------
  // :: END TAGS
  // -----------

  $scope.getResponseTime = function(reviewIn) {
    if(reviewIn.response){
      var rTime = reviewIn.response.time.split(',');
      return 'Responded on: ' +rTime[0];
    }
    return '';
  }
  $scope.convertDate = function(date){
    var monthArray = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var dateArray = date.split('-');
    var fdate = '' + monthArray[Number(dateArray[0]) - 1] + ' ' + Number(dateArray[1]) + ', ' + dateArray[2];
    return fdate;
  }

  $scope.switchRevs = function() {
    let temp = [];
    let tempCount = 0;

    tempcount = $rootScope.reviewsCount;
    $rootScope.reviewsCount = $rootScope.genReviewsCount;
    $rootScope.genReviewsCount = tempcount;

    temp = $rootScope.reviews;
    $rootScope.reviews = $rootScope.genReviews;
    $rootScope.genReviews = temp;
    if($scope.Data.reviewtoggle === 'Switch To All Reviews'){
      $scope.Data.reviewtoggle = 'Switch To Filtered Reviews';
    }
    else{
      $scope.Data.reviewtoggle = 'Switch To All Reviews';
    }

  }

  $scope.nextPage = function() {

  }

  $scope.exportSnaps = function () {
    let name = $rootScope.hotel.hotel[0].name..replace(/ /g, '_')
    $.get('https://trip.aliceapp.com:8080/snapshotcsv?id=' + $rootScope.hotel.hotel[0].id, csvString => {
      let blob = new Blob([csvString], {type: "text/plain;charset=utf-8"})
      saveAs(blob, name + '_snapshot_history.csv')
    })
  }
});

//////////////////////////////////////
////////// npm i -g mocha ////////////
////////// Run with mocha ////////////
////////// mocha test.js /////////////
//////////// or npm test /////////////
//////////////////////////////////////

// Assertion library
const expect = require('chai').expect
const request = require('superagent')
const fs = require('fs')

describe('mocha and chai', function () {
  it('mocha works?', function (done) {
    done()
  }),
  it('chai exists?', function () {
    expect(expect).to.exist
  }),
  it('chai works?', function () {
    expect(2).to.equal(2)
  })
})

////////////////////////////////////
///////// MAIN PARSER //////////////
////////////////////////////////////

describe('parser', function () {
  describe('hotelurls', function () {
    const getHotelUrlsFromCity = require('./tp-hotelurls.js')
    it('module exits', function () {
      expect(getHotelUrlsFromCity).to.exist
    })
    it('should return an array of urls for all hotels in the area', function (done) {
      this.timeout(40000)
      let url = 'https://www.tripadvisor.com/Hotels-g34172-Daytona_Beach_Florida-Hotels.html'
      getHotelUrlsFromCity(url, function (hotelurls) {
        expect(hotelurls).to.be.instanceof(Array)
        expect(hotelurls[1].slice(0,5)).to.equal('https')
        done()
      })
    })
  })
  describe('metadata', function () {
    const getMetaData = require('./tp-metadata.js')
    it('module exists', function () {
      expect(getMetaData).to.exist
    })
    let hotel = {}
    it('should return meta data', function (done) {
      this.timeout(40000)
      let urls = [
        'https://www.tripadvisor.com/Hotel_Review-g60763-d234765-Reviews-Oakwood_Ocean_At_1_West_Street-New_York_City_New_York.html',
        'https://www.tripadvisor.com/Hotel_Review-g60763-d8615610-Reviews-The_Beekman_A_Thompson_Hotel-New_York_City_New_York.html/BackUrl'
      ]
      getMetaData(urls[1], function (ihotel) {
        expect(ihotel).to.exist
        hotel = ihotel
        fs.writeFile('output/hotel.json', JSON.stringify(hotel, null, 4), function (err) {
          done()
        })
      })
    })
    it('name?', function () {
      expect(hotel.name).to.exist
    })
    it('address?', function () {
      expect(hotel.address).to.exist
    })
    it('id?', function () {
      expect(hotel.id).to.exist
    })
    it('url?', function () {
      expect(hotel.url).to.exist
    })
    it('rating?', function () {
      expect(hotel.rating).to.exist
      expect(hotel.rating).to.within(1,5)
      expect(hotel.rating).to.be.a('Number')
      // :: match with real value
      expect(hotel.rating).to.equal(5)
    })
    it('forbes rating?', function () {
      expect(hotel.forbes_rating).to.exist
      expect(hotel.forbes_rating).to.be.within(0,5)
      // :: match with real value
      expect(hotel.forbes_rating).to.equal(5)
    })
    it('ranking?', function () {
      expect(hotel.ranking).to.exist
      expect(hotel.ranking.total).to.be.above(-1)
      expect(hotel.ranking.num).to.not.be.null
      expect(hotel.ranking.num).to.be.above(-1)
    })
    it('phone?', function () {
      expect(hotel.phone_number).to.exist
      expect(hotel.phone_number).to.have.length.above(2)
    })
    it('certificate?', function () {
      expect(hotel.certificate).to.be.oneOf([true, false])
    })
    it('review counts', function () {
      expect(hotel.excellent).to.be.above(-1)
      expect(hotel.very_good).to.be.above(-1)
      expect(hotel.average).to.be.above(-1)
      expect(hotel.poor).to.be.above(-1)
      expect(hotel.terrible).to.be.above(-1)
    })
    it('max page', function () {
      expect(hotel.max_page).to.be.not.null
    })
    it('tags and keywords', function () {
      expect(hotel.keywords).to.be.instanceof(Array)
      expect(hotel.tags).to.be.instanceof(Array)
    })
  })

  describe('review pages', function () {
    it('module exists', function () {
      const getReviewPages = require('./tp-review-pages.js')
      expect(getReviewPages).to.exist
    })
    it('should return an array of urls', function (done) {
      const getReviewPages = require('./tp-review-pages.js')
      let url = 'https://www.tripadvisor.com/Hotel_Review-g60864-d111971-Reviews-Grenoble_House-New_Orleans_Louisiana.html'
      getReviewPages(url, 39, function (review_pages) {
        expect(review_pages).to.exist
        expect(review_pages).to.be.instanceof(Array)
        expect(review_pages[0]).to.contain('https')
        fs.writeFile('output/review_pages.json', JSON.stringify(review_pages, null, 4), function (err) {
          done()
        })
      })
    })
  })

  describe('review data', function () {
    it('module exists', function () {
      const getReviewData = require('./tp-review-partial.js')
      expect(getReviewData).to.exist
    })
    it('returns reviews with ids', function (done) {
      this.timeout(40000)
      const getReviewData = require('./tp-review-partial.js')
      urls = [
        'https://www.tripadvisor.com/Hotel_Review-g28970-d84029-Reviews-The_Georgetown_Inn-Washington_DC_District_of_Columbia.html',
        'https://www.tripadvisor.com/Hotel_Review-g60864-d111971-Reviews-or0-Grenoble_House-New_Orleans_Louisiana.html',
        'https://www.tripadvisor.com/Hotel_Review-g60864-d111971-Reviews-or10-Grenoble_House-New_Orleans_Louisiana.html',
        'https://www.tripadvisor.com/Hotel_Review-g60864-d111971-Reviews-or20-Grenoble_House-New_Orleans_Louisiana.html',
        //'https://www.tripadvisor.com/Hotel_Review-g60864-d111971-Reviews-or30-Grenoble_House-New_Orleans_Louisiana.html'
      ]
      getReviewData(urls, function (reviews) {
        expect(reviews).to.not.be.empty
        expect(reviews[0].review_id).to.exist
        expect(reviews[0].review_id).to.be.above(0)
        fs.writeFile('output/reviews.json', JSON.stringify(reviews, null, 4), function (err) {
          done()
        })
      })
    })
  })

  describe('get state from address', function () {
    const getStateFromAddress = require('./getStateFromAddress')
    it('module exists', function () {
      expect(getStateFromAddress).to.exist
    })
    it('works with NY addresses', function () {
      expect(getStateFromAddress('z, x, NY ')).to.equal('NY')
      expect(getStateFromAddress('20 West 29th Street, at Broadway, New York City, NY 10001-4502')).to.equal('NY')
      expect(getStateFromAddress('Address: 449 W 36th St, 36th Street between 9th & 10th Avenues, New York City, NY 10018-6303 ')).to.equal('NY')
    })
    it('works with CA addresses', function () {
      expect(getStateFromAddress('z, x, CA ')).to.equal('CA')
      expect(getStateFromAddress('600 F St, San Diego, CA 92101-6310')).to.equal('CA')
      expect(getStateFromAddress('4122 S Western Ave, Los Angeles, CA 90062-1636 ')).to.equal('CA')
    })
    it('returns nothing for non US addresses', function () {
      expect(getStateFromAddress('z, x, something else ')).to.be.null
      expect(getStateFromAddress('km 5.5 Boca Paila, Tulum 77788, Mexico')).to.be.null
      expect(getStateFromAddress('Highway Cancun-Tulum (Carretera Federal 307) km 230, Tulum 77780, Mexico')).to.be.null
    })
  })
})
/*
describe('api', function () {
  describe('request parse', function () {
    it('should return a success object if key is true', function (done) {
      request
        .get('http://localhost:4334/parse/la?key=17356')
        .end(function (err, res) {
          expect(res.status).to.equal(200)
          done()
        })
    })
    it('should reject if key is false', function (done) {
      request
        .get('http://localhost:4334/parse/la?key=17346')
        .end(function (err, res) {
          expect(res.status).to.equal(401)
          done()
      })
    })
  })
})*/

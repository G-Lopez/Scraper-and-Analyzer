`use strict`
const rp = require('request-promise')
const cheerio = require('cheerio')
const utf8 = require('utf8')
const sleep = require('system-sleep')

// -- date format editor
function formatDate(txt) {
  let date = new Date(Date.parse(txt))
  return [date.getMonth() + 1, date.getDate(), date.getUTCFullYear()].join('-')
}


function getReviews(urls, callback) {
  reviews = []
  let getReviewTimeout
  getReviewTimeout = setTimeout(function () {
    callback(reviews)
  }, 10 * 1000)
  if (urls.length > 0) {
    function getReviewFromPage (HotelPageNum) {
      console.log('getting page: ', HotelPageNum + 1)
      let waitTimePerPage = 1.5
      //-- gets the data
      rp({uri : urls[HotelPageNum], transform: function (body) {return cheerio.load(body)}})
        .then(function ($) {
          $('p.partial_entry').each(function (d, el) {
            let current_review = {
              user_name : $(this).parent().parent().parent().parent().parent().parent().children('.col1of2').children('.prw_rup').children('.member_info').children().children('.mo').children('span').text(),

              header : utf8.encode($(this).parent().parent().parent().children('.quote').children('a').children('span').text()),

              user_location : $(this).parent().parent().parent().parent().parent().parent().children('.col1of2').children('.prw_rup').children('.member_info').children('.location').text().replace(/(\r\n|\n|\r|)/gm,"") || 'not stated',

              mobile : $(this).parent().parent().parent().children('.rating').children('a').text().includes('mobile'),

              total_reviews : Number($(this).parent().parent().parent().parent().parent().parent().children('.col1of2').children('.prw_rup').children('.member_info').children().eq(2).children('.memberBadging').children('.reviewerBadge').text().replace(/[a-z]/igm, '')),

              hotel_reviews : Number($(this).parent().parent().parent().parent().parent().parent().children('.col1of2').children('.prw_rup').children('.member_info').children().eq(2).children('.memberBadging').children('.contributionReviewBadge').text().replace(/[a-z]/igm, '')),

              helpful_reviews : Number($(this).parent().parent().parent().parent().parent().parent().children('.col1of2').children('.prw_rup').children('.member_info').children().eq(2).children('.memberBadging').children('.helpfulVotesBadge').text().replace(/[a-z]/igm, '')),

              review : utf8.encode($(this).text().replace(/(\r\n|\n|\r|)/gm,"").replace(/(\"|\')/gm, "'").trim().replace('More', '').replace('...', ''))
            }
            // -- Review ID w/ try catch
            try {
              //current_review.review_id = Number($(this).parent().parent().parent().parent().parent().parent().parent().attr('data-reviewid'))
              current_review.review_id = Number($(this).parent().parent().parent().parent().parent().parent().parent().attr('id').split('_')[1])
            } catch (e) {
              current_review.review_id = 'error';
            }

            // -- User Level w/ try catch
            try {
              current_review.user_level = Number($(this).parent().parent().parent().parent().parent().parent().children('.col1of2').children('.prw_rup').children('.member_info').children().eq(2).children('.memberBadging').children('.levelBadge').attr('class').replace(/[a-z]|\_/igm, '').trim())
            } catch (e) {
              current_review.user_level = 0;
            }

            // -- Time Written w/ try catch
            try {
              current_review.time_written = formatDate($(this).parent().parent().parent().children('.rating').children('.ratingDate').attr('title')  || $(this).parent().parent().children('.rating').children('.ratingDate').text().replace(/(\r\n|\n|\r|)/gm,"").split(' ').slice(1).join(" "))
            } catch (e) {
              current_review.time_written = '0-0-0';
            }

            // -- Review rating w/ try catch
            try {
              current_review.rating = Number($(this).parent().parent().parent().children('.rating').children('.ui_bubble_rating').attr('class').split(' ')[1].split('_')[1])/10
            } catch (e) {
              current_review.rating = 0;
            }
            //console.log(current_review)
            if (current_review.review_id !== 'error') {
              reviews.push(current_review)
            }
          })


          if (HotelPageNum == urls.length - 1) {
            clearTimeout(getReviewTimeout)
            callback(reviews)
            return
          } else {
            console.log('pause')
            sleep(waitTimePerPage * 1000)
            getReviewFromPage(HotelPageNum + 1)
          }
        }).catch(function (err) {
          console.log(err)
          clearTimeout(getReviewTimeout)
          callback(reviews)
          return
        })
    }
    getReviewFromPage(0)
  } else {
    callback([])
    return
  }
}

function getPartialReviewsAndEdit(urls, callback) {
  getReviews(urls, function (reviews) {
    for (i in reviews) {
      // -- add review reponses
      if(i > 0) {
        if(reviews[i-1].user_id == reviews[i].user_id) {
          reviews[i-1].response = reviews[i].review
          reviews.splice(i,1)
        }
      }
      if (i == reviews.length - 2) {
        callback(reviews)
      }
    }
    //callback(reviews)
  })
}

module.exports = getPartialReviewsAndEdit

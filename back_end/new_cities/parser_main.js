const cp = require('child_process')
const moment = require('moment')
const clear = require('clear')

let run = function (name) {
  cp.fork('./run_city.js', {env : {
    "CITY_NAME" : name
  }})
}

let runSnaps = (name) => {
  cp.fork('./run_snaps.js', {env : {
    "CITY_NAME" : name
  }})
}

let parseReviews = function () {
  cp.fork('../plus_reviews.js')
}

setInterval(() => {
  let minute = moment().minute()
  let hour   = moment().hour()
  if (hour == 0) {
    if (minute == 1) {
      runSnaps('nyc')
      runSnaps('austin')
      runSnaps('washington_dc')
      runSnaps('chapel_hill')
    }
    if (minute == 16) {
      runSnaps('guadalaraja')
      runSnaps('orlando')
      runSnaps('boston')
      runSnaps('kissimmee')
    }
    if (minute == 26) {
      runSnaps('miami')
      runSnaps('tucson')
      runSnaps('atlanta')
      runSnaps('el_paso')
    }
    if (minute == 34) {
      runSnaps('memphis')
      runSnaps('san_francisco')
      runSnaps('tulum')
      runSnaps('vail')
    }
    if (minute == 45) {
      runSnaps('chicago')
      runSnaps('san_jose')
      runSnaps('london')
      runSnaps('long_beach')
    }
  } else if (hour == 12) {
    if (minute == 1) {
      runSnaps('nashville')
      runSnaps('san_antonio')
      runSnaps('san_diego')
      runSnaps('rome')
      runSnaps('oklahoma_city')
    }
    if (minute == 16) {
      runSnaps('denver')
      runSnaps('charlotte')
      runSnaps('houston')
      runSnaps('clearwater')
    }
    if (minute == 26) {
      runSnaps('phoenix')
      runSnaps('port_aransas')
      runSnaps('new_orleans')
      runSnaps('tampa')
    }
    if (minute == 34) {
      runSnaps('brooklyn')
      runSnaps('monterey')
      runSnaps('la')
      runSnaps('caribbean')
    }
    if (minute == 45) {
      runSnaps('dallas')
      runSnaps('seattle')
      runSnaps('las_vegas')
      runSnaps('cape_town')
      runSnaps('mexico_city')
    }
  }
}, 1000 * 60)

setInterval(function () {
  clear()
  let hour = moment().hour()
  console.log(hour)
  if (hour % 8 == 0) {
    parseReviews()
  }
  if (hour == 0) {
    run('nyc')
    run('boston')
    run('guadalaraja')
    run('vail')
    run('oklahoma_city')
  }
  if (hour == 2) {
    run('chapel_hill')
    run('kissimmee')
    run('el_paso')
    run('london')
    run('caribbean')
  }
  if (hour == 4) {
    run('orlando')
    run('miami')
    run('tucson')
    run('long_beach')
  }
  if (hour == 6) {
    run('atlanta')
    run('phoenix')
    run('cozumel')
    run('rome')
  }
  if (hour == 8) {
    run('san_francisco')
    run('austin')
    run('tulum')
    run('clearwater')
  }
  if (hour == 10) {
    run('philli')
    run('seattle')
    run('puerto_vallarta')
    run('las_vegas')
  }
  if (hour == 12) {
    run('la')
    run('memphis')
    run('cancun')
    run('cape_town')
  }
  if (hour == 14) {
    run('scottsdale')
    run('new_orleans')
    run('fort_worth')
  }
  if (hour == 16) {
    run('nashville')
    run('houston')
    run('port_aransas')
    run('mexico_city')
  }
  if (hour == 18) {
    run('denver')
    run('chicago')
    run('san_jose')
    run('tampa')
  }
  if (hour == 20) {
    run('dallas')
    run('myrtle_beach')
    run('monterey')
    run('washington_dc')
  }
  if (hour == 22) {
    run('charlotte')
    run('san_antonio')
    run('san_diego')
    run('brooklyn')
  }
}, 1000 * 60 * 60)

// -- Get data from the server [X]
// -- Send POST to server with city info [ ]
function cookiesToJSON (text) {
  res = JSON.parse('{"' + text.replace(/ /gm, '').replace(/;/gm, '","').replace(/=/gm, '":"') + '"}')
  return res
}

let url = 'https://trip-advisor.aliceapp.com:4056/add'

let bar = new Nanobar()
bar.go(15)
let ticket = ''
try {
  ticket = cookiesToJSON(document.cookie).ticket
} catch (err) {
  console.log(err)
}

$(function() {
  $.get('https://trip-advisor.aliceapp.com:8080/admin?ticket=' + ticket, res => {
    $('.data').append(res)
    bar.go(100)
  })
})

function checkForNull(a, b) {
  return (a.slice(0,4) == 'http') && b
}

$('button').click(function () {
  let city = {
      url  : $('#city_url').val()
    , name : $('#city_name').val()
  }
  console.log(city)
  if (checkForNull(city.url, city.name)) {
    bar.go(20)
    console.info('good to go');
    $.post(url, city, function (res) {
      bar.go(100)
    })
    bar.go(100)
  } else {
    alert('sorry, there is an input error')
  }
})

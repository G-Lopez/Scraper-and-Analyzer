const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const jsonfile = require('jsonfile')
const fs = require('fs')

const port = 4056
const https = require('https')
let httpsOptions = {
  key : fs.readFileSync('/etc/nginx/ssl/ssl.key'),
  cert: fs.readFileSync('/etc/nginx/ssl/ssl.crt')
}

https.createServer(httpsOptions, app).listen(port) //https
console.log('running on %s', port)

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// -- body parser setup to parse JSON
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('aight, looks like it works')
})

app.post('/add', function (req, res) {
  jsonfile.readFile('tp-config.json', function (err, file) {
    file.cities[req.body.name.toLowerCase().replace(' ', '_')] = {
      name : req.body.name,
      url : req.body.url
    }
    jsonfile.writeFile('tp-config.json', file, {spaces: 4}, function (err) {
      if (err) {
        console.log(err)
      }
      console.log('uploaded', req.body.name)
      res.send('success')
    })
  })
})

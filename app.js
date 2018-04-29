'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const app = express()
const api = require('./routes');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// Add headers
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})


app.use('/api', api)

app.get('/login', (req, res)=> {
  res.render('login')
})


module.exports = app

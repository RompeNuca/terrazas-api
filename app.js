'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express()

// Req routes
const userRoutes = require('./routes/user');
const moduleRoutes = require('./routes/module');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Add headers
app.use(cors())

// Api rotes
// User
app.use('/api', userRoutes);
// Module
app.use('/api', moduleRoutes);

// App route

app.use('/', express.static('public'))

app.get('https://comer-despierto.herokuapp.com/api/*', (req, res) => {
 res.sendFile(__dirname + '/public/index.html');
})


module.exports = app

'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express()

// Req routes
const userRoutes = require('./routes/user');

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Add headers
app.use(cors())

// Api rotes
// User
app.use('/api', userRoutes);

// App route
app.use(express.static('public'));

module.exports = app

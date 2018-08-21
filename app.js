'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const app = express()

// Req routes
const promoRoutes = require('./routes/promo')
const eventtRoutes = require('./routes/eventt')
const userRoutes = require('./routes/user')
const storeRoutes = require('./routes/store')
const categoryRoutes = require('./routes/category')
const sectionRoutes = require('./routes/section')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('public'));
app.use('/upload', express.static('upload'));

// Add headers
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, access-control-allow-origin');
    next();
})

// Use routes
app.use('/api', userRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/eventt', eventtRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/section', sectionRoutes);

module.exports = app

'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PromoSchema = Schema({
    father_id: Array,
    name: String,
    title: String,
    info: String,
    promoImage: String,
    validity: {
      // time: { type: String, default: '24' },
      since: String,
      until: String
    },
    legals: String,
    stores: Array
},{
  collection: 'promos'
})

module.exports = mongoose.model('Promo', PromoSchema)

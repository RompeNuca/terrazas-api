'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PromoSchema = Schema({
    _id: mongoose.Schema.Types.ObjectId,
    eventts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Eventt'}],
    name: String,
    title: String,
    info: String,
    promoImage: String,
    validity: {
      state: false,
      since: String,
      until: String
    },
    legals: String,
    stores: Array
},{
  collection: 'promos'
})

module.exports = mongoose.model('Promo', PromoSchema)

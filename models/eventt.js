'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  type: { type: Boolean},
  shortInfo: String,
  info: String,
  eventtImage: String,
  eventtCover: String,
  promos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Promo'}],
  lastEdit: Number,
  day: String,
  hour: String,
  validity: {
    state: { type: Boolean, default: false },
    since: String,
    until: String
    }
  },{
  collection: 'eventts'
})

module.exports = mongoose.model('Eventt', EventSchema)

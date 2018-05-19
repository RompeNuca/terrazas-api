'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  type: { type: String, enum: ['destacado','simple'] },
  shortInfo: String,
  info: String,
  eventtImage: String,
  eventtCover: String,
  promos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Promo'}],
  date: { type: Date, default: Date.now() },
  day: String,
  hour: Number,
  validity: {
    state: false,
    since: String,
    until: String
    }
  },{
  collection: 'eventts'
})

module.exports = mongoose.model('Eventt', EventSchema)

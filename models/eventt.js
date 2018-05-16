'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = Schema({
  title: String,
  type: { type: String, enum: ['destacado','simple'] },
  shortInfo: String,
  info: String,
  eventtImage: String,
  eventtCover: String,
  promos_id: Array,
  date: { type: Date, default: Date.now() },
  day: String,
  hour: Number,
  validity: {
    // time: { type: String, default: '24' },
    since: String,
    until: String
    }
  },{
  collection: 'eventts'
})

module.exports = mongoose.model('Eventt', EventSchema)

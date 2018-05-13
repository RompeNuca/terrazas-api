'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = Schema({
  title: String,
  type: { type: String, enum: ['destacado','simple'] },
  shortInfo: String,
  info: String,
  eventImage: String,
  promos: Array,
  date: { type: Date, default: Date.now() },
  validity: {
    // time: { type: String, default: '24' },
    since: String,
    until: String
    }
  },{
  collection: 'events'
})

module.exports = mongoose.model('Event', EventSchema)

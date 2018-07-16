'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SectionSchema = Schema({
  name: String,
  info: String,
  sectionImage: String,
  extra: Schema.Types.Mixed,
  },{
  collection: 'sections'
})

module.exports = mongoose.model('Section', SectionSchema)

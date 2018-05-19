'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SectionSchema = Schema({
  title: String,
  info: String,
  sectionImage: String,
  extra: new Objet,
  },{
  collection: 'sections'
})

module.exports = mongoose.model('Section', SectionSchema)

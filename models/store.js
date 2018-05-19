'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StoreSchema = Schema({
    name: String,
    logo: String,
    pos: Number,
    floor: Number,
    type: { type: String, enum: ['Local', 'Stand'] }
    category: Array,
    category_id: Array,
    info: {
      text: String,
      web: String,
      tel: String,
    }
},{
  collection: 'stores'
})

module.exports = mongoose.model('Store', StoreSchema)

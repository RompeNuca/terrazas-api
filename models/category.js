'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CategorySchema = Schema({
    name: String,
    info: String,
    stores_id: Array,
    categoryImage: String
    }
},{
  collection: 'categorys'
})

module.exports = mongoose.model('Category', CategorySchema)

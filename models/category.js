'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CategorySchema = Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    info: String,
    categoryImage: String,
    stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store'}],
    state: {type: Boolean},
}, {
    collection: 'categorys'
})

module.exports = mongoose.model('Category', CategorySchema)

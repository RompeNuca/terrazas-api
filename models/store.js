'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StoreSchema = Schema({
    _id: mongoose.Schema.Types.ObjectId,
    nStore: Number,
    name: String,
    info: String,
    web: String,
    tel: String,
    logo: String,
    floor: String,
    state: Boolean,
    type: String,
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category'}],
}, {
    collection: 'stores'
})

module.exports = mongoose.model('Store', StoreSchema)

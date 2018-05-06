'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductSchema = Schema({
  name: String,
  category: { type: String, enum: ['computers', 'phones', 'accesories'] },
  description: String,
  price: { type: Number, default: 0 },
  productImage: { type: String, required: false }
},{
  collection: 'products'
})

module.exports = mongoose.model('Product', ProductSchema)

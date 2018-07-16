'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductSchema = Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category'}],
  description: String,
  price: { type: Number, default: 0 },
  productImage: { type: String, required: false }
},{
  collection: 'products'
})

module.exports = mongoose.model('Product', ProductSchema)

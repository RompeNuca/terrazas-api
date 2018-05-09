'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema


const EventoSchema = Schema({
  titulo: String,
  type: { type: String, enum: ['destacado','simple'] },
  infoCorta: String,
  info: String,
  eventoImage: String,
  fechaHora: Date,
  vigencia: {
    tiempo: { type: String, default: '0000-01-00 00:00' },
    desde: String,
    hasta: String
  },
  Promo: {
    titulo: String,
    info: String,
    promoImage: String,
    vigencia: String,
    legales: String,
    locales: Array
  }
},{
  collection: 'eventos'
})


module.exports = mongoose.model('Evento', EventoSchema)

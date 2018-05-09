'use strict'

const mongoose = require('mongoose');
const Evento = require('../models/evento');
const services = require('../services');


function getEventos (req, res) {

 Evento.find({}, (err, evento) => {
   if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
   if (!evento) return res.status(404).send({message: `No hay Usuarios`})

   const eventosVigentes = services.verificarVigencia(evento)
   res.status(200).send({ eventosVigentes })
 })

}

module.exports = {
  getEventos
}

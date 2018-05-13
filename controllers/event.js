'use strict'

const mongoose = require('mongoose');
const Eventt = require('../models/event');
const services = require('../services');


function getValidEvents (req, res) {

 Eventt.find({}, (err, el) => {
   if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
   if (!el) return res.status(404).send({message: `No hay Eventos`})

   const eventValid = services.checkValidity(el)
   res.status(200).send({ eventValid })
 })

}

function saveEvent (req, res) {

  console.log('POST /api/event');
  console.log(req.body);

  let eventt = new Eventt()


  eventt.title = req.body.title
  eventt.type = req.body.type
  eventt.shortInfo = req.body.shortInfo
  eventt.info = req.body.info
  eventt.eventImage = req.body.eventImages
  eventt.date = req.body.date
  // puede requerir cambiar por req.body.validity.time depende de como pasemos la data desde el fornt
  eventt.validity.time = req.body.time
  eventt.validity.since = req.body.since
  eventt.validity.until = req.body.until

  eventt.save((err, eventtStored) =>{
    if (err) res.status(500).send({message: `Error al salvar el evento, ${err}`})
    res.status(200).send({product: eventtStored})
  })

}


module.exports = {
  getValidEvents,
  saveEvent
}

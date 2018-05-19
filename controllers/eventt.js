'use strict'

const config = require('../config');
const mongoose = require('mongoose');
const moment = require('moment');

const Promo = require('../models/promo');
const Eventt = require('../models/eventt');

const services = require('../services');

const fs = require('fs');


function getValidEventts (req, res) {

  Eventt.find()
        .populate('promos')
        .exec()
        .then(full => {
          console.log(full);
          res.status(200).send({ full })
        })

  }




function saveEventt (req, res) {

  console.log('POST /api/event');

  // console.log(req.body);

  let eventt = new Eventt()
  eventt._id = new mongoose.Types.ObjectId(),
  eventt.title = req.body.title
  eventt.type = req.body.type
  eventt.shortInfo = req.body.shortInfo
  eventt.info = req.body.info
  eventt.date = req.body.date
  eventt.promos_id = []

  if (req.files.eventtImage) {
  eventt.eventtImage = req.files.eventtImage[0].path
  }
  if (req.files.eventtCover) {
  eventt.eventtCover = req.files.eventtCover[0].path
  }

  // puede requerir cambiar por req.body.validity.time depende de como pasemos la data desde el fornt
  if (req.body.time) {
  eventt.validity.since = moment().format('YYYY-MM-DD HH:mm')
  eventt.validity.until = moment().add(req.body.time, 'hours').format('YYYY-MM-DD HH:mm')
  } else {
  eventt.validity.since = req.body.since
  eventt.validity.until = req.body.until
  }

  if (req.body.promos_id) {
  eventt.promos_id = req.body.promos_id
  }

  eventt.save((err, eventtStored) => {

    if (eventtStored.promos_id && eventtStored.promos_id !== []) {
      for (var i = 0; i < eventtStored.promos_id.length; i++) {

        let promoId = eventtStored.promos_id[i]

        Promo.findByIdAndUpdate(promoId, {
          $push: {
            eventts_id: mongoose.Types.ObjectId(eventtStored._id)
          }
        }, function(err, promo) {

          if (err) return res.status(500).send({
            message: `Error al salvar el evento en promos_id, ${err}`
          })
          if (!eventt) return res.status(404).send({
            message: `La promo no existe`
          })
        })
      }
    }

    if (err) res.status(500).send({
      message: `Error al salvar el evento, ${err}`
    })
    res.status(200).send({
      evento: eventtStored
    })

  })
}

function updateEventt (req, res) {

  const eventt = req.body;

  if (!eventt.validity) {
  eventt.validity = {}
  }

  if (!eventt.promos_id) {
  eventt.promos_id = []
  }

  if (req.files.eventtImage) {
  eventt.eventtImage = req.files.eventtImage[0].path
  }
  if (req.files.eventtCover) {
  eventt.eventtCover = req.files.eventtCover[0].path
  }

  if (req.body.time) {
  eventt.validity.since = moment().format('YYYY-MM-DD HH:mm')
  eventt.validity.until = moment().add(req.body.time, 'hours').format('YYYY-MM-DD HH:mm')
  }else {
  eventt.validity.since = req.body.since
  eventt.validity.until = req.body.until
  }

  const updateId = req.params.eventtId;

  var promoNewFathers  = req.body.promos_id;
  var promoLastFathers = [];

  //Actualiza la foto

  if (eventt.eventtImage == 'deleted') {
    fs.unlink(eventt.eventtImage, (err) => {
      if (err) res.status(500).send({message: `Error al borrar la imagen de la eventt, ${err}`})
    });
  }
  if (eventt.eventtCover == 'deleted') {
    fs.unlink(eventt.eventtCover, (err) => {
      if (err) res.status(500).send({message: `Error al borrar la portada de la eventt, ${err}`})
    });
  }

  if (eventt.eventtImage || eventt.eventtCover) {
      Eventt.findOne({ _id: updateId })
      .select(`_Id name eventImage eventtCover`)
      .exec(function (err, item) {
        if (err) res.status(500).send({message: `Error al buscar la eventt, ${err}`})
        if (eventt.eventtImage) {
          services.updateFile( updateId, eventt.eventtImage, item.eventtImage);
        }else {
          services.updateFile( updateId, eventt.eventtCover, item.eventtCover);
        }
      })
    }

  //Actualiza los ids de las eventts dentro de ls Promos
  Eventt.findOne({ _id: updateId })
  .select(`_id promos_id`)
  .exec(function (err, eve) {

     promoLastFathers = eve.promos_id

     if (promoLastFathers) {
       for (var i = 0; i < promoLastFathers.length; i++) {
         Promo.findByIdAndUpdate(promoLastFathers[i], { $pull: { eventts_id: mongoose.Types.ObjectId(eve._id) }},
          function(err, ok) {})
       }
    }


     if (promoNewFathers) {
       for (var f = 0; f < promoNewFathers.length; f++) {
        Promo.findByIdAndUpdate(promoNewFathers[f], { $push: { eventts_id: mongoose.Types.ObjectId(eve._id)}},
          function(err, ok) {})
       }
     }

  })

  //Actualiza El evento en su coleccion
  Eventt.findByIdAndUpdate( updateId, eventt, (err, eventtUpdate) => {

    if (err) return res.status(500).send({message: `Error al actualizar la eventt, ${err}`})
    if (!eventtUpdate) return res.status(404).send({message: `El eventt no existe`})
    res.status(200).send({ eventt: eventt })

  })
}

function deleteEventt (req, res) {

  let eventtId = req.params.eventtId


  // Busca el evento
  Eventt.findById(eventtId, (err, eventt) => {
    if (err) res.status(500).send({message: `Error al borrar el evento, ${err}`})
    if (!eventt) return res.status(404).send({message: `El evento no existe`})

    //Borrar la imagen del  evento si es que existe
    if (eventt.eventtImage && eventt.eventtImage !== 'delete') {
      fs.unlink(eventt.eventtImage, (err) => {
        if (err) res.status(500).send({message: `Error al borrar la imagen del evento, ${err}`})
        // console.log('la imagen del evento fue eliminada');
      });
    }
    if (eventt.eventtCover && eventt.eventtCover !== 'delete') {
      fs.unlink(eventt.eventtCover, (err) => {
        if (err) res.status(500).send({message: `Error al borrar la imagen del evento, ${err}`})
        // console.log('la imagen del evento fue eliminada');
      });
    }

    //Borrar el evento de las promos en los que existe
    for (var i = 0; i < eventt.promos_id.length; i++) {

      if (eventt.promos_id[i]) {
        Promo.findByIdAndUpdate(eventt.promos_id[i], {
          $pull: {
            eventts_id: mongoose.Types.ObjectId(eventt._id)
          }
        }, function(err, promo) {
          if (err) return res.status(500).send({
            message: `Error al actualizar la promo, ${err}`
          })
          if (!promo) return res.status(404).send({
            message: `la promo no existe`
          })
        })
      }
    }

    //Borrar el evento en su coleccion
    eventt.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar el evento, ${err}`})
      res.status(200).send({menssage: `El evento a sido eliminado`})
    })

  })

}


module.exports = {
  getValidEventts,
  saveEventt,
  updateEventt,
  deleteEventt
}

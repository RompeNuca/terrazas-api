'use strict'

const config = require('../config');
const mongoose = require('mongoose');
const moment = require('moment');

const Promo = require('../models/promo');
const Eventt = require('../models/eventt');

const services = require('../services');

const fs = require('fs');

function getValidPromos (req, res) {

 Promo.find({}, (err, el) => {
   if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
   if (!el) return res.status(404).send({message: `No hay Promos`})

   let promosValid = services.filterValidity(el)
   res.status(200).send({ promosValid })
 })

}

function getValidPromo (req, res) {

  let promoId = req.params.promoId

  Promo.findById(promoId, (err, promo) => {
    if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
    if (!promo) return res.status(404).send({message: `La promo no existe`})

    let promoValid = services.filterValidity(promo)
    res.status(200).send({ promoValid })
  })

}

function savePromo (req, res) {

  console.log('POST /api/promo');
  // console.log(req.body);

  let promo = new Promo()
  promo._id = new mongoose.Types.ObjectId(),
  promo.name = req.body.name
  promo.title = req.body.title
  promo.info = req.body.info
  promo.legals = req.body.legals
  promo.stores = req.body.stores

  if (req.file) {
  promo.promoImage = req.file.path
  }

  promo.eventts_id = []
  if (req.body.eventts_id) {
  promo.eventts_id = req.body.eventts_id
  }

  // !!!puede requerir CAMBIAR por req.body.validity.time depende de como pasemos la data desde el fornt

  if (req.body.time) {
  promo.validity.since = moment().format('YYYY-MM-DD HH:mm')
  promo.validity.until = moment().add(req.body.time, 'hours').format('YYYY-MM-DD HH:mm')
  }else {
  promo.validity.since = req.body.since
  promo.validity.until = req.body.until
  }

  //Guardar la promo en su coleccion
  promo.save((err, promoStored) => {
    if (err) res.status(500).send({
      message: `Error al salvar la promo, ${err}`
    })
    res.status(200).send({
      promos: promoStored
    })
  })

  //Guardar el id de la promo en los eventos elegidos
  if (promo.eventts_id && promo.eventts_id !== []) {
    for (var i = 0; i < promo.eventts_id.length; i++) {
      Eventt.findByIdAndUpdate(promo.eventts_id[i], {
        $push: { promos_id: mongoose.Types.ObjectId(promo._id) }
      }, (err, item) => {
        if (err)   return res.status(500).send({ message: `Error al actualizar el evento con la promo, ${err}` })
        if (!item) return res.status(404).send({ message: `El evento no existe` })
        // if (!item) return console.log(`cuidado un evento no existe o no se puedo encontrar`);
      })
    }
  }

}

function updatePromo(req, res) {

  let promo = req.body;

  let updateId = req.params.promoId;
  let promoNewFathers = req.body.eventts_id;
  let promoLastFathers = [];

  if (!promo.validity) {
    promo.validity = {}
  }
  if (!promo.eventts_id) {
    promo.eventts_id = []
  }
  if (req.file) {
    promo.promoImage = req.file.path;
  }
  if (req.body.time) {
    promo.validity.since = moment().format('YYYY-MM-DD HH:mm')
    promo.validity.until = moment().add(req.body.time, 'hours').format('YYYY-MM-DD HH:mm')
  } else {
    promo.validity.since = req.body.since
    promo.validity.until = req.body.until
  }

  Promo.findOne({
      _id: updateId
    })
    .select(`_id eventts_id promoImage`)
    .exec(function(err, item) {
      if (err) res.status(500).send({
        message: `Error al buscar la promo, ${err}`
      })

      //Elimina la imagen
      if (promo.promoImage && promo.promoImage == 'delete' && item.promoImage !== 'delete') {
        fs.unlink(item.promoImage, (err) => {
          if (err) res.status(500).send({
            message: `Error al borrar la imagen de la promo, ${err}`
          })
          // console.log(`La imagen ${item.promoImage} fue eliminada`);
        });
      }

      //Actualiza la imagen
      if (promo.promoImage && promo.promoImage !== 'delete') {
        services.updateFile(updateId, promo.promoImage, item.promoImage, (err) => {
          if (err) res.status(500).send({
            message: `Error al actualizar la imagen de la promo, ${err}`
          })
          // console.log(`La imagen ${item.promoImage} fue remplazada por ${promo.promoImage}`);
        });
      }

      //Actualiza los ids de las promos dentro de lo Eventos
      //Se buscan los eventos relacionados a las promos.
      promoLastFathers = item.eventts_id

      if (promoLastFathers) {
        for (var i = 0; i < promoLastFathers.length; i++) {
          Eventt.findByIdAndUpdate(promoLastFathers[i], {
              $pull: {
                promos_id: mongoose.Types.ObjectId(item._id)
              }
            },
            function(err, ok) {})
        }
      }

      if (promoNewFathers) {
        for (var f = 0; f < promoNewFathers.length; f++) {
          Eventt.findByIdAndUpdate(promoNewFathers[f], {
              $push: {
                promos_id: mongoose.Types.ObjectId(item._id)
              }
            },
            function(err, ok) {})
        }
      }

    })

  //Actualiza la Promo en su coleccion
  Promo.findByIdAndUpdate(updateId, promo, (err, promoUpdate) => {
    if (err) return res.status(500).send({
      message: `Error al actualizar la promo, ${err}`
    })
    if (!promoUpdate) return res.status(404).send({
      message: `La promo no existe`
    })
    res.status(200).send(promo)
  })

}

function deletePromo (req, res) {

  let promoId = req.params.promoId

  // Busca la promo
  Promo.findById(promoId, (err, promo) => {
    if (err) res.status(500).send({message: `Error al borrar la promo, ${err}`})
    if (!promo) return res.status(404).send({message: `La promo no existe`})

    //Borrar la imagen de la promo si es que existe
    if (promo.promoImage && promo.promoImage !== 'delete') {
      fs.unlink(promo.promoImage, (err) => {
        if (err) res.status(500).send({message: `Error al borrar la imagen de la promo, ${err}`})
        // console.log('la imagen de la promo fue eliminada');
      });
    }

    //Borrar la promo de los eventos en los que existe
    for (var i = 0; i < promo.eventts_id.length; i++) {

      if (promo.eventts_id[i]) {
        Eventt.findByIdAndUpdate(promo.eventts_id[i], {
          $pull: {
            promos_id: mongoose.Types.ObjectId(promo._id)
          }
        }, function(err, eventt) {
          if (err) return res.status(500).send({
            message: `Error al actualizar el evento, ${err}`
          })
          if (!eventt) return res.status(404).send({
            message: `El evento no existe`
          })
        })
      }
    }

    //Borrar la promo en su coleccion
    promo.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar la promo, ${err}`})
      res.status(200).send({menssage: `La promo a sido eliminado`})
    })

  })

}


module.exports = {
  getValidPromos,
  getValidPromo,
  savePromo,
  updatePromo,
  deletePromo
}

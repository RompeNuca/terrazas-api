'use strict'

const config = require('../config');
const mongoose = require('mongoose');

const Promo = require('../models/promo');
const Eventt = require('../models/event');

const services = require('../services');

const fs = require('fs');

function getValidPromos (req, res) {

 Promo.find({}, (err, el) => {
   if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
   if (!el) return res.status(404).send({message: `No hay Eventos`})

   let promosValid = services.checkValidity(el)
   res.status(200).send({ promosValid })
 })

}

function getValidPromo (req, res) {

  let promoId = req.params.promoId

  Promo.findById(promoId, (err, promo) => {
    if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
    if (!promo) return res.status(404).send({message: `La promo no existe`})

    let promoValid = services.checkValidity(promo)
    res.status(200).send({ promoValid })
  })

}

function savePromo (req, res) {

  console.log('POST /api/promo');
  // console.log(req.body);

  let promo = new Promo()
  promo._id = new mongoose.Types.ObjectId(),
  promo.father_id = req.body.father_id
  promo.name = req.body.name
  promo.title = req.body.title
  promo.info = req.body.info
  if (req.file) {
  promo.promoImage = req.file.path
  }
  promo.legals = req.body.legals
  promo.stores = req.body.stores
  // puede requerir cambiar por req.body.validity.time depende de como pasemos la data desde el fornt
  promo.validity.time = req.body.time
  promo.validity.since = req.body.since
  promo.validity.until = req.body.until


  promo.save((err, promoStored) => {
    if (err) res.status(500).send({
      message: `Error al salvar la promo, ${err}`
    })
    res.status(200).send({
      promos: promoStored
    })

    for (var i = 0; i < promoStored.father_id.length; i++) {

      let fatherId = promoStored.father_id[i]

      if (fatherId) {

        Eventt.findByIdAndUpdate(fatherId, {
          $push: {
            promos: promoStored._id.toString()
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
  })

}

function updatePromo (req, res) {

  const promo = req.body;

  const updateId = req.params.promoId;
    var promoNewFathers  = req.body.father_id;
    var promoLastFathers = [];

  //Actualiza la foto

    if (!promo.promoImage == undefined) {
      promo.promoImage = '';
    }

    if (req.file) {
      promo.promoImage = req.file.path;
    }
    Promo.findOne({ _id: updateId })
    .select(`_Id name promoImage`)
    .exec(function (err, item) {
      services.updateFile( updateId, promo.promoImage, item.promoImage);
    })


  //Actualiza los ids de las promos dentro de lo Eventos
  //Se buscan los eventos relacionados a las promos.
  Promo.findOne({ _id: updateId })
  .select(`_id father_id`)
  .exec(function (err, pro) {

     promoLastFathers = pro.father_id

     if (promoLastFathers) {
       for (var i = 0; i < promoLastFathers.length; i++) {
         Eventt.findByIdAndUpdate(promoLastFathers[i], { $pull: { promos: pro._id.toString() }},
          function(err, ok) {})
       }
    }


     if (promoNewFathers) {
       for (var f = 0; f < promoNewFathers.length; f++) {
        Eventt.findByIdAndUpdate(promoNewFathers[f], { $push: { promos: pro._id.toString() }},
          function(err, ok) {})
       }
     }

  })

  //Actualiza la Promo en su coleccion
  Promo.findByIdAndUpdate( updateId, promo, (err, promoUpdate) => {

    if (err) return res.status(500).send({message: `Error al actualizar la promo, ${err}`})
    if (!promoUpdate) return res.status(404).send({message: `La promo no existe`})
    res.status(200).send({ promo: promo })

  })
}

function deletePromo (req, res) {

  let promoId = req.params.promoId

  Promo.findById(promoId, (err, promo) => {
    if (err) res.status(500).send({message: `Error al borrar la promo, ${err}`})
    if (!promo) return res.status(404).send({message: `La promo no existe`})

    fs.unlink(promo.promoImage, (err) => {
      if (err) res.status(500).send({message: `Error al borrar la imagen de la promo, ${err}`})
      console.log('la imagen de la promo fue eliminada');
    });

    for (var i = 0; i < promo.father_id.length; i++) {

      let fatherId = promo.father_id[i]

      if (fatherId) {

        Eventt.findByIdAndUpdate(fatherId, {
          $pull: {
            promos: promo._id
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

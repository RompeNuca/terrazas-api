'use strict'

const config = require('../config');
const mongoose = require('mongoose');
const moment = require('moment');

const Promo = require('../models/promo');
const Eventt = require('../models/eventt');

const services = require('../services');

const fs = require('fs');

function getSimplePromos(req, res) {
  Promo.find()
        .select(`name`)
        .then(promos => {
    res.status(200).send({ promos })
  })
}

function getValidPromos (req, res) {

 Promo.find({}, (err, el) => {
   if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
   if (!el) return res.status(404).send({message: `No hay Promos`})

   let promosValid = services.checkValidity(el)
   let promosOrder = promosValid.sort(function (a, b) {
      if (a.lastEdit < b.lastEdit) {
        return 1;
      }
      if (a.lastEdit > b.lastEdit) {
        return -1;
      }
      return 0;
   })

   res.status(200).send({ promosOrder, message: 'promos cargadas con exito' })
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

  let promo = new Promo()
  promo._id = req.body._id,
  promo.name = req.body.name
  promo.title = req.body.title
  promo.info = req.body.info
  promo.legals = req.body.legals
  promo.stores = req.body.stores
  promo.lastEdit = moment().unix()

  if (req.file) {
  promo.promoImage = req.file.path
  }

  promo.eventts = []
  if (req.body.eventts) {
  promo.eventts = req.body.eventts
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
      message: `La promo se creo correctamente`
    })
  })

  //Guardar el id de la promo en los eventos elegidos
  if (promo.eventts && promo.eventts !== []) {
    for (var i = 0; i < promo.eventts.length; i++) {
      Eventt.findByIdAndUpdate(promo.eventts[i], {
        $push: { promos: mongoose.Types.ObjectId(promo._id) }
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

      promo.lastEdit = moment().unix()

  if (!promo.validity) {
    promo.validity = {}
  }
  if (!promo.eventts) {
    promo.eventts = []
  }
  if (req.file) {
    promo.promoImage = req.file.path
  }
  if (req.body.time) {
    promo.validity.since = moment().format('YYYY-MM-DD HH:mm')
    promo.validity.until = moment().add(req.body.time, 'hours').format('YYYY-MM-DD HH:mm')
  } else {
    promo.validity.since = req.body.since
    promo.validity.until = req.body.until
  }
  // se puede refactorizar y hacer el findByIdAndUpdate directamente una vez
  Promo.findOne({ _id: updateId })
    .select(`_id eventts promoImage`)
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

      let promoLastFathers = item.eventts
      let promoNewFathers = promoLastFathers

      if (!Array.isArray(req.body.eventts)) {
          promoNewFathers = [req.body.eventts]
      }else {
          promoNewFathers = req.body.eventts;
      }

      if (promoLastFathers !== promoNewFathers) {

          for (var i = 0; i < promoLastFathers.length; i++) {
            Eventt.findByIdAndUpdate(promoLastFathers[i], {
                $pull: {
                  promos: mongoose.Types.ObjectId(item._id)
                }
              },
              function(err, ok) {})
          }

          for (var f = 0; f < promoNewFathers.length; f++) {
            Eventt.findByIdAndUpdate(promoNewFathers[f], {
                $push: {
                  promos: mongoose.Types.ObjectId(item._id)
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
    res.status(200).send({message: `La promo fue editada con exito`})

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
      let server = `${config.domain}${config.port}`
      let file = promo.promoImage
      console.log('archivo ' + file);
      fs.unlink(file, (err) => {
        if (err) res.status(500).send({message: `Error al borrar la imagen de la promo, ${err}`})
        console.log('la imagen de la promo fue eliminada');
      });
    }

    if (promo.eventts !== []) {
      //Borrar la promo de los eventos en los que existe
      for (var i = 0; i < promo.eventts.length; i++) {

        if (promo.eventts[i]) {
          Eventt.findByIdAndUpdate(promo.eventts[i], {
            $pull: {
              promos: mongoose.Types.ObjectId(promo._id)
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
    }


    //Borrar la promo en su coleccion
    promo.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar la promo, ${err}`})
      res.status(200).send({menssage: `La promo a sido eliminado`})
    })

  })

}


module.exports = {
  getSimplePromos,
  getValidPromos,
  getValidPromo,
  savePromo,
  updatePromo,
  deletePromo
}

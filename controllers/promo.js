'use strict'

const config = require('../config');
const mongoose = require('mongoose');
const moment = require('moment');
const Promo = require('../models/promo');
const Eventt = require('../models/eventt');

const services = require('../services');

const fs = require('fs');

const promoPath = 'api-demo/promos/'

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
  promo.promoImage = config.domain + config.port + '/' + req.file.path
  }

  promo.eventts = []
  if (req.body.eventts) {
  promo.eventts = req.body.eventts
  }

  if (req.body.time) {
  promo.validity.since = moment().format('YYYY-MM-DD HH:mm')
  promo.validity.until = moment().add(req.body.time, 'hours').format('YYYY-MM-DD HH:mm')
  }else {
  promo.validity.since = req.body.since
  promo.validity.until = req.body.until
  }

  //Sube la imagen a el cloud
  services.uploadFileCloud ( promo.promoImage, promoPath, wow => {
    //Espera que la imagen suba y despues...
    if (wow == 'err') res.status(500).send({message: `Error al guardar la imagen en la nube`})

    //guarda el path de la imagen ya cargada en la nube
    if (wow) {
      promo.promoImage = wow

      //Borra el archivo de la carpeta temporal
      let fileRute = req.file.path;
      fs.unlink(fileRute, (err) => {
        if (err) res.status(500).send({message: `Error al borrar la imagen temporal de la promo, ${err}`})
      });
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
    promo.promoImage = config.domain + config.port + '/' + req.file.path
  }
  if (req.body.time) {
    promo.validity.since = moment().format('YYYY-MM-DD HH:mm')
    promo.validity.until = moment().add(req.body.time, 'hours').format('YYYY-MM-DD HH:mm')
  } else {
    promo.validity.since = req.body.since
    promo.validity.until = req.body.until
  }

  
  services.uploadFileCloud(promo.promoImage, promoPath, (wow)=>{
    if (wow) {
      promo.promoImage = wow
    }

    Promo.findByIdAndUpdate(updateId, promo)
      .select(`_id eventts promoImage`)
      .exec(function(err, item) {
        if (err) res.status(500).send({ message: `Error al buscar la promo, ${err}` })
        if (!promo) return res.status(404).send({ message: `La promo no existe` })
        
        let promoLastEventt = item.eventts
        let promoNewEventts = promoLastEventt /* Esta igualacion es provisoria hace que al no mandadar nada, nada cambie */

        if (!Array.isArray(req.body.eventts)) {
            promoNewEventts = [req.body.eventts]
        } else {
            promoNewEventts = req.body.eventts;
        }

        //Actualiza los ids de las promos dentro de los eventts

        if (promoLastEventt !== promoNewEventts) {

            for (var i = 0; i < promoLastEventt.length; i++) {
              Eventt.findByIdAndUpdate(promoLastEventt[i], { $pull: { promos: mongoose.Types.ObjectId(item._id) } },
                  (err, ok) => {if (err) res.status(500).send({ message: `Error al buscar el ${i} evento viejo, ${err}` })})
            }

            for (var f = 0; f < promoNewEventts.length; f++) {
              Eventt.findByIdAndUpdate(promoNewEventts[f], { $push: { promos: mongoose.Types.ObjectId(item._id) } },
                  (err, ok) => {if (err) res.status(500).send({ message: `Error al buscar el ${i} evento nuevo, ${err}` })})
            }
        }

      //Actualizar las imagenes

      if (promo.promoImage && promo.promoImage !== 'delete') {
        services.deleteFileCloud(item.promoImage, promoPath, () => {})
      }

      res.status(200).send({ message: `${promo.name} se edito correctamente` })
    })
  })
}

function deletePromo (req, res) {

  let promoId = req.params.promoId

  // Busca la promo
  Promo.findById(promoId, (err, promo) => {

    if (err) res.status(500).send({message: `Error al borrar la promo, ${err}`})
    if (!promo) return res.status(404).send({message: `La promo no existe`})

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


    //Borrar la imagen de la promo si es que existe
    if (promo.promoImage && promo.promoImage !== 'delete') {

      let fileRute = promo.promoImage
      let matchCloud = promo.promoImage.substr(0,config.cloudDomain.length) 

      if (matchCloud == config.cloudDomain) {
        services.deleteFileCloud(fileRute, promoPath,  (err) => {
          if (err) res.status(500).send({message: `Error al borrar la imagen de la promo en la nube, ${err}`})
          // console.log('la imagen de la promo fue eliminada');
        });
      }else{
        fs.unlink(fileRute, (err) => {
          if (err) res.status(500).send({message: `Error al borrar la imagen de la promo, ${err}`})
          // console.log('la imagen de la promo fue eliminada');
        });
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

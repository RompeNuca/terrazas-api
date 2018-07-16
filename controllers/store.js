'use strict'

const config = require('../config');
const mongoose = require('mongoose');
const moment = require('moment');

const Store = require('../models/store');
const Category = require('../models/category');

const services = require('../services');
const fs = require('fs');

function getSimpleStores (req, res) {
  Store.find()
        .select(`name`)
        .then(stores => {
    res.status(200).send({ stores })
  })
}

function getStores (req, res) {

 Store.find({}, (err, el) => {
   if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
   if (!el) return res.status(404).send({message: `No hay Locales`})

   let storesOrder = el.sort(function (a, b) {
      if (a.nStore > b.nStore) {
        return 1;
      }
      if (a.nStore < b.nStore) {
        return -1;
      }
      return 0;
   })
   res.status(200).send({ storesOrder, message: 'Locales cargadas con exito' })
 })

}

function getStore (req, res) {

  let storeId = req.params.storeId

  Store.findById(storeId, (err, store) => {
    if (err) return res.status(500).send({message: `Error al relaizar la peticion, ${err}`})
    if (!store) return res.status(404).send({message: `El local no existe`})

    res.status(200).send({ store })
  })

}

function saveStore (req, res) {

  let store = new Store()
  store._id = req.body._id,
  store.nStore = req.body.nStore,
  store.name = req.body.name
  store.info = req.body.info
  store.web = req.body.web
  store.tel = req.body.tel
  store.floor = req.body.floor
  store.state = req.body.state
  store.logo = ''
  if (req.file) {
  store.logo = req.file.path
  }
  store.type = 'Local'
  if (req.body.type) {
  store.type = req.body.type
  }
  store.category = []
  if (req.body.category) {
  store.category = req.body.category
  }

  //Guardar el store en su coleccion
  store.save((err, storeStored) => {
    if (err) res.status(500).send({
      message: `Error al salvar el local, ${err}`
    })
    res.status(200).send({
      message: `El local se creo correctamente`
    })
  })

  //Guardar el id del store en los eventos elegidos
  if (store.category && store.category !== []) {
    for (var i = 0; i < store.category.length; i++) {
      Category.findByIdAndUpdate(store.category[i], {
        $push: { stores: mongoose.Types.ObjectId(store._id) }
      }, (err, item) => {
        if (err)   return res.status(500).send({ message: `Error al actualizar la category con el local, ${err}` })
        if (!item) return res.status(404).send({ message: `El evento no existe` })
      })
    }
  }

}

function updateStore(req, res) {

  let store = req.body;
  let updateId = req.params.storeId;

  if (!store.category) {
    store.category = []
  }

  if (req.file) {
    store.logo = req.file.path
  }

  Store.findByIdAndUpdate(updateId, store)
      .select(`_id name category logo`)
      .exec(function(err, item) {
          if (err) res.status(500).send({ message: `Error al buscar del local, ${err}` })
          if (!store) return res.status(404).send({ message: `El local no existe` })

          let storeLastCategory = item.category
          let storeNewCategory = storeLastCategory

          if (!Array.isArray(req.body.category)) {
              storeNewCategory = [req.body.category]
          } else {
              storeNewCategory = req.body.category;
          }

          //Actualiza los ids de los stores dentro de las categorys

          if (storeLastCategory !== storeNewCategory) {
              for (var i = 0; i < storeLastCategory.length; i++) {
                  Category.findByIdAndUpdate(storeLastCategory[i], { $pull: { stores: mongoose.Types.ObjectId(item._id) } },
                      function(err, ok) {})
              }
              for (var f = 0; f < storeNewCategory.length; f++) {
                  Category.findByIdAndUpdate(storeNewCategory[f], { $push: { stores: mongoose.Types.ObjectId(item._id) } },
                      function(err, ok) {})
              }
          }

          //Manejo de imagenes

          //Actualizar las imagenes
          if (store.logo && store.logo !== 'delete') {
            services.updateFile(updateId, store.logo, item.logo, (err) => {
                if (err) res.status(500).send({ message: `Error al actualizar la imagen del local, ${err}` })
            });
          }

          //Elimina las imagenes
          if (store.logo == 'delete' && item.logo !== 'delete') {
              fs.unlink(item.logo, (err) => {
                  if (err) res.status(500).send({ message: `Error al borrar la imagen del local, ${err}` })
                      // console.log(`La imagen ${item.logo} fue eliminada`);
              });
          }

          res.status(200).send({ store: store })
      })
  }

function deleteStore (req, res) {

  let storeId = req.params.storeId

  // Busca el local
  Store.findById(storeId, (err, store) => {

    if (err) res.status(500).send({message: `Error al borrar el local, ${err}`})
    if (!store) return res.status(404).send({message: `El local no existe`})

    //Borrar la imagen del local si es que existe
    if (store.logo && store.logo !== 'delete') {
      let file = store.logo
      fs.unlink(file, (err) => {
        if (err) res.status(500).send({message: `Error al borrar el logo del local, ${err}`})
        // console.log('el logo del local fue eliminado');
      });
    }

    if (store.category && store.category !== []) {
      //Borrar el local de las categorias en los que existe
      for (var i = 0; i < store.category.length; i++) {
        if (store.category[i]) {
          Store.findByIdAndUpdate(store.category[i], {
            $pull: {
              category: mongoose.Types.ObjectId(stores._id)
            }
          }, function(err, store) {
            if (err) return res.status(500).send({
              message: `Error al actualizar el local, ${err}`
            })
            if (!store) return res.status(404).send({
              message: `El local no existe`
            })
          })
        }
      }
    }

    //Borrar el local en su coleccion
    store.remove(err => {
      if (err) res.status(500).send({message: `Error al borrar el local, ${err}`})
      res.status(200).send({menssage: `El local a sido eliminado`})
    })

  })

}


module.exports = {
  getSimpleStores,
  getStores,
  getStore,
  saveStore,
  updateStore,
  deleteStore
}
